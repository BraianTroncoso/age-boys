import { adminDb } from '../lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

// Interfaces - IDs are now strings (Firestore doc IDs)
interface User {
  id: string;
  username: string;
  email?: string;
  favoriteCiv: string;
  eloRating: number;
  eloTeams: number;
  eloFfa: number;
  isAdmin: boolean;
  createdAt: string;
}

interface Match {
  id: string;
  matchType: string;
  playedAt: string;
  createdBy: string | null;
  createdAt: string;
}

interface MatchParticipant {
  id: string;
  matchId: string;
  playerId: string;
  team: number | null;
  civilization: string;
  isWinner: boolean;
  eloChange: number;
}

interface Tournament {
  id: string;
  name: string;
  size: number;
  status: 'active' | 'completed' | 'cancelled';
  bracketType: 'single' | 'double';
  bracketReset: boolean;
  affectsElo: boolean;
  winnerId: string | null;
  createdBy: string;
  createdAt: string;
  completedAt: string | null;
}

interface TournamentMatch {
  id: string;
  tournamentId: string;
  bracket: 'winners' | 'losers' | 'grand_final' | 'final_reset';
  round: number;
  position: number;
  player1Id: string | null;
  player2Id: string | null;
  winnerId: string | null;
  matchId: string | null;
  playedAt: string | null;
}

// Helpers
function toISO(val: any): string {
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (val instanceof Date) return val.toISOString();
  return val || new Date().toISOString();
}

function docToUser(doc: FirebaseFirestore.DocumentSnapshot): User | undefined {
  if (!doc.exists) return undefined;
  const d = doc.data()!;
  return {
    id: doc.id,
    username: d.username,
    email: d.email,
    favoriteCiv: d.favoriteCiv || 'spanish',
    eloRating: d.eloRating ?? 1000,
    eloTeams: d.eloTeams ?? 1000,
    eloFfa: d.eloFfa ?? 1000,
    isAdmin: d.isAdmin ?? false,
    createdAt: toISO(d.createdAt),
  };
}

function docToMatch(doc: FirebaseFirestore.DocumentSnapshot): Match | undefined {
  if (!doc.exists) return undefined;
  const d = doc.data()!;
  return {
    id: doc.id,
    matchType: d.matchType,
    createdBy: d.createdBy || null,
    playedAt: toISO(d.playedAt),
    createdAt: toISO(d.createdAt),
  };
}

function docToTournament(doc: FirebaseFirestore.DocumentSnapshot): Tournament | undefined {
  if (!doc.exists) return undefined;
  const d = doc.data()!;
  return {
    id: doc.id,
    name: d.name,
    size: d.size,
    status: d.status || 'active',
    bracketType: d.bracketType || 'single',
    bracketReset: d.bracketReset ?? true,
    affectsElo: d.affectsElo ?? true,
    winnerId: d.winnerId || null,
    createdBy: d.createdBy,
    createdAt: toISO(d.createdAt),
    completedAt: d.completedAt ? toISO(d.completedAt) : null,
  };
}

function docToTournamentMatch(doc: FirebaseFirestore.DocumentSnapshot): TournamentMatch | undefined {
  if (!doc.exists) return undefined;
  const d = doc.data()!;
  return {
    id: doc.id,
    tournamentId: d.tournamentId,
    bracket: d.bracket || 'winners',
    round: d.round,
    position: d.position,
    player1Id: d.player1Id || null,
    player2Id: d.player2Id || null,
    winnerId: d.winnerId || null,
    matchId: d.matchId || null,
    playedAt: d.playedAt ? toISO(d.playedAt) : null,
  };
}

// Collections
const usersCol = () => adminDb.collection('users');
const matchesCol = () => adminDb.collection('matches');
const tournamentsCol = () => adminDb.collection('tournaments');
const tournamentMatchesCol = () => adminDb.collection('tournamentMatches');

export function invalidateCache(): void {}

export const db = {
  users: {
    findAll: async (): Promise<User[]> => {
      const snap = await usersCol().orderBy('eloRating', 'desc').get();
      return snap.docs.map(d => docToUser(d)!);
    },
    findAllPlayers: async (orderBy: 'eloRating' | 'eloTeams' | 'eloFfa' = 'eloRating'): Promise<User[]> => {
      const snap = await usersCol().orderBy(orderBy, 'desc').get();
      return snap.docs.map(d => docToUser(d)!).filter(u => !u.isAdmin);
    },
    findAllPlayersWithStats: async (orderBy: 'eloRating' | 'eloTeams' | 'eloFfa' = 'eloRating'): Promise<Array<User & { totalMatches: number; wins: number }>> => {
      const [usersSnap, matchesSnap] = await Promise.all([
        usersCol().orderBy(orderBy, 'desc').get(),
        matchesCol().get(),
      ]);
      const users = usersSnap.docs.map(d => docToUser(d)!).filter(u => !u.isAdmin);

      const statsMap = new Map<string, { total: number; wins: number }>();
      for (const doc of matchesSnap.docs) {
        const participants = doc.data().participants || [];
        for (const p of participants) {
          const s = statsMap.get(p.playerId) || { total: 0, wins: 0 };
          s.total++;
          if (p.isWinner) s.wins++;
          statsMap.set(p.playerId, s);
        }
      }

      return users.map(u => ({
        ...u,
        totalMatches: statsMap.get(u.id)?.total || 0,
        wins: statsMap.get(u.id)?.wins || 0,
      }));
    },
    findByUsername: async (username: string): Promise<User | undefined> => {
      const snap = await usersCol().where('username', '==', username).limit(1).get();
      return snap.empty ? undefined : docToUser(snap.docs[0]);
    },
    findById: async (id: string): Promise<User | undefined> => {
      const doc = await usersCol().doc(id).get();
      return docToUser(doc);
    },
    create: async (user: { id: string; username: string; email?: string; favoriteCiv: string }): Promise<User> => {
      const data = {
        username: user.username,
        email: user.email || undefined,
        favoriteCiv: user.favoriteCiv,
        eloRating: 1000,
        eloTeams: 1000,
        eloFfa: 1000,
        isAdmin: false,
        createdAt: FieldValue.serverTimestamp(),
      };
      await usersCol().doc(user.id).set(data);
      return { id: user.id, ...data, isAdmin: false, eloRating: 1000, eloTeams: 1000, eloFfa: 1000, createdAt: new Date().toISOString() };
    },
    update: async (id: string, updates: Partial<User>) => {
      const cleaned: Record<string, any> = {};
      if (updates.favoriteCiv !== undefined) cleaned.favoriteCiv = updates.favoriteCiv;
      if (updates.eloRating !== undefined) cleaned.eloRating = updates.eloRating;
      if (updates.eloTeams !== undefined) cleaned.eloTeams = updates.eloTeams;
      if (updates.eloFfa !== undefined) cleaned.eloFfa = updates.eloFfa;
      if (updates.isAdmin !== undefined) cleaned.isAdmin = updates.isAdmin;
      if (Object.keys(cleaned).length > 0) {
        await usersCol().doc(id).update(cleaned);
      }
    },
  },

  players: {
    findAll: async (): Promise<User[]> => db.users.findAll(),
    findById: async (id: string): Promise<User | undefined> => db.users.findById(id),
    findByName: async (name: string): Promise<User | undefined> => db.users.findByUsername(name),
    update: async (id: string, updates: Partial<User>) => db.users.update(id, updates),
  },

  matches: {
    findAll: async (): Promise<Match[]> => {
      const snap = await matchesCol().orderBy('playedAt', 'desc').get();
      return snap.docs.map(d => docToMatch(d)!);
    },
    findRecentWithParticipants: async (limit: number = 5) => {
      const snap = await matchesCol().orderBy('playedAt', 'desc').limit(limit).get();
      return snap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          matchType: d.matchType,
          playedAt: toISO(d.playedAt),
          createdBy: d.createdBy || null,
          createdAt: toISO(d.createdAt),
          participants: (d.participants || []).map((p: any) => ({
            ...p,
            matchId: doc.id,
            isWinner: Boolean(p.isWinner),
            playerName: p.playerName || 'Unknown',
          })),
        };
      });
    },
    countAll: async (): Promise<number> => {
      const snap = await matchesCol().count().get();
      return snap.data().count;
    },
    findPaginatedWithParticipants: async (page: number = 1, perPage: number = 5) => {
      const total = await db.matches.countAll();
      const offset = (page - 1) * perPage;
      const snap = await matchesCol().orderBy('playedAt', 'desc').offset(offset).limit(perPage).get();

      const matches = snap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          matchType: d.matchType,
          playedAt: toISO(d.playedAt),
          createdBy: d.createdBy || null,
          createdAt: toISO(d.createdAt),
          creatorName: d.creatorName || null,
          participants: (d.participants || []).map((p: any) => ({
            ...p,
            matchId: doc.id,
            isWinner: Boolean(p.isWinner),
            playerName: p.playerName || 'Unknown',
          })),
        };
      });
      return { matches, total };
    },
    findById: async (id: string): Promise<Match | undefined> => {
      const doc = await matchesCol().doc(id).get();
      return docToMatch(doc);
    },
    create: async (match: { matchType: string; createdBy?: string }): Promise<Match> => {
      const data = {
        matchType: match.matchType,
        createdBy: match.createdBy || null,
        creatorName: null as string | null,
        playedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
        playerIds: [] as string[],
        participants: [] as any[],
      };
      if (match.createdBy) {
        const creator = await db.users.findById(match.createdBy);
        data.creatorName = creator?.username || null;
      }
      const ref = await matchesCol().add(data);
      return { id: ref.id, matchType: match.matchType, createdBy: match.createdBy || null, playedAt: new Date().toISOString(), createdAt: new Date().toISOString() };
    },
    delete: async (id: string) => {
      await matchesCol().doc(id).delete();
    },
  },

  participants: {
    findByMatchId: async (matchId: string): Promise<MatchParticipant[]> => {
      const doc = await matchesCol().doc(matchId).get();
      if (!doc.exists) return [];
      const participants = doc.data()?.participants || [];
      return participants.map((p: any, i: number) => ({
        id: `${matchId}_${i}`,
        matchId,
        playerId: p.playerId,
        team: p.team ?? null,
        civilization: p.civilization,
        isWinner: Boolean(p.isWinner),
        eloChange: p.eloChange || 0,
      }));
    },
    findByPlayerId: async (playerId: string): Promise<MatchParticipant[]> => {
      const snap = await matchesCol().where('playerIds', 'array-contains', playerId).get();
      const result: MatchParticipant[] = [];
      snap.docs.forEach(doc => {
        const participants = doc.data().participants || [];
        participants.forEach((p: any, i: number) => {
          if (p.playerId === playerId) {
            result.push({
              id: `${doc.id}_${i}`,
              matchId: doc.id,
              playerId: p.playerId,
              team: p.team ?? null,
              civilization: p.civilization,
              isWinner: Boolean(p.isWinner),
              eloChange: p.eloChange || 0,
            });
          }
        });
      });
      return result;
    },
    create: async (participant: Omit<MatchParticipant, 'id'>): Promise<MatchParticipant> => {
      const player = await db.users.findById(participant.playerId);
      const pData = {
        playerId: participant.playerId,
        playerName: player?.username || 'Unknown',
        team: participant.team,
        civilization: participant.civilization,
        isWinner: participant.isWinner,
        eloChange: participant.eloChange,
      };
      await matchesCol().doc(participant.matchId).update({
        participants: FieldValue.arrayUnion(pData),
        playerIds: FieldValue.arrayUnion(participant.playerId),
      });
      return { id: `${participant.matchId}_${participant.playerId}`, ...participant };
    },
  },

  tournaments: {
    findAll: async (): Promise<Tournament[]> => {
      const snap = await tournamentsCol().orderBy('createdAt', 'desc').get();
      return snap.docs.map(d => docToTournament(d)!);
    },
    findActive: async (): Promise<Tournament[]> => {
      const snap = await tournamentsCol().where('status', '==', 'active').get();
      return snap.docs.map(d => docToTournament(d)!).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    findCompleted: async (): Promise<Tournament[]> => {
      const snap = await tournamentsCol().where('status', '==', 'completed').get();
      return snap.docs.map(d => docToTournament(d)!).sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
    },
    findById: async (id: string): Promise<Tournament | undefined> => {
      const doc = await tournamentsCol().doc(id).get();
      return docToTournament(doc);
    },
    create: async (tournament: { name: string; size: number; createdBy: string; bracketType?: 'single' | 'double'; bracketReset?: boolean; affectsElo?: boolean }): Promise<Tournament> => {
      const data = {
        name: tournament.name,
        size: tournament.size,
        status: 'active',
        bracketType: tournament.bracketType || 'single',
        bracketReset: tournament.bracketReset !== false,
        affectsElo: tournament.affectsElo !== false,
        winnerId: null,
        createdBy: tournament.createdBy,
        createdAt: FieldValue.serverTimestamp(),
        completedAt: null,
      };
      const ref = await tournamentsCol().add(data);
      return { id: ref.id, ...data, status: 'active' as const, bracketType: data.bracketType as 'single' | 'double', createdAt: new Date().toISOString() };
    },
    update: async (id: string, updates: Partial<Tournament>) => {
      const cleaned: Record<string, any> = {};
      if (updates.status !== undefined) cleaned.status = updates.status;
      if (updates.winnerId !== undefined) cleaned.winnerId = updates.winnerId;
      if (updates.completedAt !== undefined) cleaned.completedAt = updates.completedAt;
      if (Object.keys(cleaned).length > 0) {
        await tournamentsCol().doc(id).update(cleaned);
      }
    },
    delete: async (id: string) => {
      const tmSnap = await tournamentMatchesCol().where('tournamentId', '==', id).get();
      const batch = adminDb.batch();
      tmSnap.docs.forEach(d => batch.delete(d.ref));
      batch.delete(tournamentsCol().doc(id));
      await batch.commit();
    },
  },

  tournamentMatches: {
    findByTournamentId: async (tournamentId: string): Promise<TournamentMatch[]> => {
      const snap = await tournamentMatchesCol().where('tournamentId', '==', tournamentId).get();
      return snap.docs.map(d => docToTournamentMatch(d)!)
        .sort((a, b) => a.bracket < b.bracket ? -1 : a.bracket > b.bracket ? 1 : b.round - a.round || a.position - b.position);
    },
    findById: async (id: string): Promise<TournamentMatch | undefined> => {
      const doc = await tournamentMatchesCol().doc(id).get();
      return docToTournamentMatch(doc);
    },
    create: async (match: Omit<TournamentMatch, 'id'>): Promise<TournamentMatch> => {
      const data = {
        tournamentId: match.tournamentId,
        bracket: match.bracket || 'winners',
        round: match.round,
        position: match.position,
        player1Id: match.player1Id,
        player2Id: match.player2Id,
        winnerId: match.winnerId,
        matchId: match.matchId,
        playedAt: match.playedAt,
      };
      const ref = await tournamentMatchesCol().add(data);
      return { id: ref.id, ...data } as TournamentMatch;
    },
    update: async (id: string, updates: Partial<TournamentMatch>) => {
      const cleaned: Record<string, any> = {};
      if (updates.player1Id !== undefined) cleaned.player1Id = updates.player1Id;
      if (updates.player2Id !== undefined) cleaned.player2Id = updates.player2Id;
      if (updates.winnerId !== undefined) cleaned.winnerId = updates.winnerId;
      if (updates.matchId !== undefined) cleaned.matchId = updates.matchId;
      if (updates.playedAt !== undefined) cleaned.playedAt = updates.playedAt;
      if (Object.keys(cleaned).length > 0) {
        await tournamentMatchesCol().doc(id).update(cleaned);
      }
    },
    findByRoundAndPosition: async (tournamentId: string, round: number, position: number, bracket: string = 'winners'): Promise<TournamentMatch | undefined> => {
      const snap = await tournamentMatchesCol()
        .where('tournamentId', '==', tournamentId)
        .where('bracket', '==', bracket)
        .where('round', '==', round)
        .where('position', '==', position)
        .limit(1)
        .get();
      return snap.empty ? undefined : docToTournamentMatch(snap.docs[0]);
    },
    findByBracket: async (tournamentId: string, bracket: string): Promise<TournamentMatch[]> => {
      const snap = await tournamentMatchesCol()
        .where('tournamentId', '==', tournamentId)
        .where('bracket', '==', bracket)
        .get();
      return snap.docs.map(d => docToTournamentMatch(d)!)
        .sort((a, b) => b.round - a.round || a.position - b.position);
    },
  },
};

// Stats queries - read from Firestore matches with embedded participants
export const statsQueries = {
  getPlayerWinsLosses: async (playerId: string): Promise<{ wins: number; losses: number }> => {
    const snap = await matchesCol().where('playerIds', 'array-contains', playerId).get();
    let wins = 0, losses = 0;
    snap.docs.forEach(doc => {
      for (const p of doc.data().participants || []) {
        if (p.playerId === playerId) { p.isWinner ? wins++ : losses++; }
      }
    });
    return { wins, losses };
  },

  getWeeklyLoserOptimized: async (): Promise<{ playerId: string; username: string; losses: number; wins: number } | null> => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const snap = await matchesCol().where('playedAt', '>=', Timestamp.fromDate(oneWeekAgo)).get();

    const stats = new Map<string, { wins: number; losses: number }>();
    snap.docs.forEach(doc => {
      for (const p of doc.data().participants || []) {
        const s = stats.get(p.playerId) || { wins: 0, losses: 0 };
        p.isWinner ? s.wins++ : s.losses++;
        stats.set(p.playerId, s);
      }
    });

    let worst: { playerId: string; losses: number; wins: number } | null = null;
    for (const [pid, s] of stats) {
      if (s.losses > 0 && (!worst || s.losses > worst.losses)) {
        worst = { playerId: pid, losses: s.losses, wins: s.wins };
      }
    }
    if (!worst) return null;
    const user = await db.users.findById(worst.playerId);
    if (!user || user.isAdmin) return null;
    return { ...worst, username: user.username };
  },

  getWeeklyPolleraOptimized: async (): Promise<{ playerId: string; username: string; gamesPlayed: number } | null> => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const snap = await matchesCol().where('playedAt', '>=', Timestamp.fromDate(oneWeekAgo)).get();

    const counts = new Map<string, number>();
    snap.docs.forEach(doc => {
      for (const p of doc.data().participants || []) {
        counts.set(p.playerId, (counts.get(p.playerId) || 0) + 1);
      }
    });

    let least: { playerId: string; gamesPlayed: number } | null = null;
    for (const [pid, cnt] of counts) {
      if (!least || cnt < least.gamesPlayed) {
        least = { playerId: pid, gamesPlayed: cnt };
      }
    }
    if (!least) return null;
    const user = await db.users.findById(least.playerId);
    if (!user || user.isAdmin) return null;
    return { ...least, username: user.username };
  },

  getAllPlayersStats: async (): Promise<Map<string, { wins: number; losses: number }>> => {
    const snap = await matchesCol().get();
    const statsMap = new Map<string, { wins: number; losses: number }>();
    snap.docs.forEach(doc => {
      for (const p of doc.data().participants || []) {
        const s = statsMap.get(p.playerId) || { wins: 0, losses: 0 };
        p.isWinner ? s.wins++ : s.losses++;
        statsMap.set(p.playerId, s);
      }
    });
    return statsMap;
  },

  getPlayerStreakOptimized: async (playerId: string): Promise<Array<{ matchId: string; playedAt: string; isWinner: boolean }>> => {
    const snap = await matchesCol().where('playerIds', 'array-contains', playerId).orderBy('playedAt', 'desc').get();
    const results: Array<{ matchId: string; playedAt: string; isWinner: boolean }> = [];
    snap.docs.forEach(doc => {
      const d = doc.data();
      for (const p of d.participants || []) {
        if (p.playerId === playerId) {
          results.push({ matchId: doc.id, playedAt: toISO(d.playedAt), isWinner: Boolean(p.isWinner) });
        }
      }
    });
    return results;
  },

  getPlayerFullStatsOptimized: async (playerId: string): Promise<{ wins: number; losses: number; history: Array<{ playedAt: string; isWinner: boolean }> }> => {
    const snap = await matchesCol().where('playerIds', 'array-contains', playerId).orderBy('playedAt', 'asc').get();
    let wins = 0, losses = 0;
    const history: Array<{ playedAt: string; isWinner: boolean }> = [];
    snap.docs.forEach(doc => {
      const d = doc.data();
      for (const p of d.participants || []) {
        if (p.playerId === playerId) {
          const isWinner = Boolean(p.isWinner);
          history.push({ playedAt: toISO(d.playedAt), isWinner });
          isWinner ? wins++ : losses++;
        }
      }
    });
    return { wins, losses, history };
  },

  getNemesisVictimOptimized: async (playerId: string): Promise<Array<{ opponentId: string; opponentName: string; wins: number; losses: number }>> => {
    const snap = await matchesCol().where('playerIds', 'array-contains', playerId).get();
    const h2h = new Map<string, { wins: number; losses: number }>();

    snap.docs.forEach(doc => {
      const d = doc.data();
      if (d.matchType !== '1v1') return;
      const parts = d.participants || [];
      const me = parts.find((p: any) => p.playerId === playerId);
      const opp = parts.find((p: any) => p.playerId !== playerId);
      if (!me || !opp) return;
      const s = h2h.get(opp.playerId) || { wins: 0, losses: 0 };
      me.isWinner ? s.wins++ : s.losses++;
      h2h.set(opp.playerId, s);
    });

    return Array.from(h2h.entries()).map(([oppId, s]) => ({
      opponentId: oppId,
      opponentName: '', // filled by caller if needed
      ...s,
    }));
  },

  getWeeklyGamesCountOptimized: async (): Promise<Map<string, number>> => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const snap = await matchesCol().where('playedAt', '>=', Timestamp.fromDate(oneWeekAgo)).get();
    const gamesMap = new Map<string, number>();
    snap.docs.forEach(doc => {
      for (const p of doc.data().participants || []) {
        gamesMap.set(p.playerId, (gamesMap.get(p.playerId) || 0) + 1);
      }
    });
    return gamesMap;
  },

  getFirstMatchResult: async (playerId: string): Promise<boolean | null> => {
    const snap = await matchesCol().where('playerIds', 'array-contains', playerId).orderBy('playedAt', 'asc').limit(1).get();
    if (snap.empty) return null;
    const parts = snap.docs[0].data().participants || [];
    const me = parts.find((p: any) => p.playerId === playerId);
    return me ? Boolean(me.isWinner) : null;
  },

  getPlayerRecentMatches: async (playerId: string, limit: number = 10): Promise<Array<{ matchId: string; matchType: string; playedAt: string; civilization: string; isWinner: boolean; eloChange: number }>> => {
    const snap = await matchesCol().where('playerIds', 'array-contains', playerId).orderBy('playedAt', 'desc').limit(limit).get();
    const results: Array<{ matchId: string; matchType: string; playedAt: string; civilization: string; isWinner: boolean; eloChange: number }> = [];
    snap.docs.forEach(doc => {
      const d = doc.data();
      for (const p of d.participants || []) {
        if (p.playerId === playerId) {
          results.push({
            matchId: doc.id,
            matchType: d.matchType,
            playedAt: toISO(d.playedAt),
            civilization: p.civilization,
            isWinner: Boolean(p.isWinner),
            eloChange: p.eloChange || 0,
          });
        }
      }
    });
    return results;
  },
};

export type { User, Match, MatchParticipant, Tournament, TournamentMatch };
export type Player = User;
