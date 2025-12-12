import { createClient } from '@libsql/client';

// Turso client
const client = createClient({
  url: import.meta.env.TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL || '',
  authToken: import.meta.env.TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || '',
});

// Interfaces
interface User {
  id: number;
  username: string;
  passwordHash: string;
  favoriteCiv: string;
  eloRating: number;
  eloTeams: number;
  eloFfa: number;
  isAdmin: number;
  createdAt: string;
}

interface Match {
  id: number;
  matchType: string;
  playedAt: string;
  createdBy: number | null;
  createdAt: string;
}

interface MatchParticipant {
  id: number;
  matchId: number;
  playerId: number;
  team: number | null;
  civilization: string;
  isWinner: boolean;
  eloChange: number;
}

interface Tournament {
  id: number;
  name: string;
  size: number;
  status: 'active' | 'completed' | 'cancelled';
  bracketType: 'single' | 'double';
  bracketReset: boolean;
  affectsElo: boolean;
  winnerId: number | null;
  createdBy: number;
  createdAt: string;
  completedAt: string | null;
}

interface TournamentMatch {
  id: number;
  tournamentId: number;
  bracket: 'winners' | 'losers' | 'grand_final' | 'final_reset';
  round: number;
  position: number;
  player1Id: number | null;
  player2Id: number | null;
  winnerId: number | null;
  matchId: number | null;
  playedAt: string | null;
}

// Initialize tables
async function initTables() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      favoriteCiv TEXT DEFAULT 'spanish',
      eloRating REAL DEFAULT 1000,
      eloTeams REAL DEFAULT 1000,
      eloFfa REAL DEFAULT 1000,
      isAdmin INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      matchType TEXT NOT NULL,
      createdBy INTEGER,
      playedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS match_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      matchId INTEGER NOT NULL,
      playerId INTEGER NOT NULL,
      team INTEGER,
      civilization TEXT,
      isWinner INTEGER DEFAULT 0,
      eloChange REAL DEFAULT 0
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      size INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      bracketType TEXT DEFAULT 'single',
      bracketReset INTEGER DEFAULT 1,
      affectsElo INTEGER DEFAULT 1,
      winnerId INTEGER,
      createdBy INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      completedAt TEXT
    )
  `);

  // Add columns if they don't exist (for existing databases)
  try {
    await client.execute(`ALTER TABLE tournaments ADD COLUMN bracketType TEXT DEFAULT 'single'`);
  } catch (e) { /* Column already exists */ }
  try {
    await client.execute(`ALTER TABLE tournaments ADD COLUMN bracketReset INTEGER DEFAULT 1`);
  } catch (e) { /* Column already exists */ }
  try {
    await client.execute(`ALTER TABLE tournaments ADD COLUMN affectsElo INTEGER DEFAULT 1`);
  } catch (e) { /* Column already exists */ }

  await client.execute(`
    CREATE TABLE IF NOT EXISTS tournament_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournamentId INTEGER NOT NULL,
      bracket TEXT DEFAULT 'winners',
      round INTEGER NOT NULL,
      position INTEGER NOT NULL,
      player1Id INTEGER,
      player2Id INTEGER,
      winnerId INTEGER,
      matchId INTEGER,
      playedAt TEXT,
      UNIQUE(tournamentId, bracket, round, position)
    )
  `);

  // Add bracket column if it doesn't exist (for existing databases)
  try {
    await client.execute(`ALTER TABLE tournament_matches ADD COLUMN bracket TEXT DEFAULT 'winners'`);
  } catch (e) { /* Column already exists */ }
}

// Initialize on first import
let initialized = false;
async function ensureInit() {
  if (!initialized) {
    await initTables();
    initialized = true;
  }
}

// Database operations
export const db = {
  users: {
    findAll: async (): Promise<User[]> => {
      await ensureInit();
      const result = await client.execute('SELECT * FROM users ORDER BY eloRating DESC');
      return result.rows as unknown as User[];
    },
    findAllPlayers: async (orderBy: 'eloRating' | 'eloTeams' | 'eloFfa' = 'eloRating'): Promise<User[]> => {
      await ensureInit();
      // Excluir admin del ranking
      const result = await client.execute(`SELECT * FROM users WHERE username != 'admin' ORDER BY ${orderBy} DESC`);
      return result.rows as unknown as User[];
    },
    findByUsername: async (username: string): Promise<User | undefined> => {
      await ensureInit();
      const result = await client.execute({
        sql: 'SELECT * FROM users WHERE username = ?',
        args: [username]
      });
      return result.rows[0] as unknown as User | undefined;
    },
    findById: async (id: number): Promise<User | undefined> => {
      await ensureInit();
      const result = await client.execute({
        sql: 'SELECT * FROM users WHERE id = ?',
        args: [id]
      });
      return result.rows[0] as unknown as User | undefined;
    },
    create: async (user: { username: string; passwordHash: string; favoriteCiv: string }): Promise<User> => {
      await ensureInit();
      const result = await client.execute({
        sql: 'INSERT INTO users (username, passwordHash, favoriteCiv) VALUES (?, ?, ?) RETURNING *',
        args: [user.username, user.passwordHash, user.favoriteCiv]
      });
      return result.rows[0] as unknown as User;
    },
    update: async (id: number, updates: Partial<User>) => {
      await ensureInit();
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.favoriteCiv !== undefined) {
        fields.push('favoriteCiv = ?');
        values.push(updates.favoriteCiv);
      }
      if (updates.eloRating !== undefined) {
        fields.push('eloRating = ?');
        values.push(updates.eloRating);
      }
      if (updates.eloTeams !== undefined) {
        fields.push('eloTeams = ?');
        values.push(updates.eloTeams);
      }
      if (updates.eloFfa !== undefined) {
        fields.push('eloFfa = ?');
        values.push(updates.eloFfa);
      }
      if (updates.isAdmin !== undefined) {
        fields.push('isAdmin = ?');
        values.push(updates.isAdmin);
      }

      if (fields.length > 0) {
        values.push(id);
        await client.execute({
          sql: `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
          args: values
        });
      }
    }
  },

  // Alias for compatibility
  players: {
    findAll: async (): Promise<User[]> => {
      return db.users.findAll();
    },
    findById: async (id: number): Promise<User | undefined> => {
      return db.users.findById(id);
    },
    findByName: async (name: string): Promise<User | undefined> => {
      return db.users.findByUsername(name);
    },
    update: async (id: number, updates: Partial<User>) => {
      return db.users.update(id, updates);
    }
  },

  matches: {
    findAll: async (): Promise<Match[]> => {
      await ensureInit();
      const result = await client.execute('SELECT * FROM matches ORDER BY playedAt DESC');
      return result.rows as unknown as Match[];
    },
    findById: async (id: number): Promise<Match | undefined> => {
      await ensureInit();
      const result = await client.execute({
        sql: 'SELECT * FROM matches WHERE id = ?',
        args: [id]
      });
      return result.rows[0] as unknown as Match | undefined;
    },
    create: async (match: { matchType: string; createdBy?: number }): Promise<Match> => {
      await ensureInit();
      const result = await client.execute({
        sql: 'INSERT INTO matches (matchType, createdBy) VALUES (?, ?) RETURNING *',
        args: [match.matchType, match.createdBy || null]
      });
      return result.rows[0] as unknown as Match;
    },
    delete: async (id: number) => {
      await ensureInit();
      // Primero eliminar participantes
      await client.execute({
        sql: 'DELETE FROM match_participants WHERE matchId = ?',
        args: [id]
      });
      // Luego eliminar partida
      await client.execute({
        sql: 'DELETE FROM matches WHERE id = ?',
        args: [id]
      });
    }
  },

  participants: {
    findByMatchId: async (matchId: number): Promise<MatchParticipant[]> => {
      await ensureInit();
      const result = await client.execute({
        sql: 'SELECT * FROM match_participants WHERE matchId = ?',
        args: [matchId]
      });
      return result.rows.map(row => ({
        ...row,
        isWinner: Boolean(row.isWinner)
      })) as unknown as MatchParticipant[];
    },
    findByPlayerId: async (playerId: number): Promise<MatchParticipant[]> => {
      await ensureInit();
      const result = await client.execute({
        sql: 'SELECT * FROM match_participants WHERE playerId = ?',
        args: [playerId]
      });
      return result.rows.map(row => ({
        ...row,
        isWinner: Boolean(row.isWinner)
      })) as unknown as MatchParticipant[];
    },
    create: async (participant: Omit<MatchParticipant, 'id'>): Promise<MatchParticipant> => {
      await ensureInit();
      const result = await client.execute({
        sql: 'INSERT INTO match_participants (matchId, playerId, team, civilization, isWinner, eloChange) VALUES (?, ?, ?, ?, ?, ?) RETURNING *',
        args: [
          participant.matchId,
          participant.playerId,
          participant.team,
          participant.civilization,
          participant.isWinner ? 1 : 0,
          participant.eloChange
        ]
      });
      const row = result.rows[0] as any;
      return {
        ...row,
        isWinner: Boolean(row.isWinner)
      } as MatchParticipant;
    }
  },

  tournaments: {
    findAll: async (): Promise<Tournament[]> => {
      await ensureInit();
      const result = await client.execute('SELECT * FROM tournaments ORDER BY createdAt DESC');
      return result.rows.map((row: any) => ({
        ...row,
        bracketType: row.bracketType || 'single',
        bracketReset: Boolean(row.bracketReset),
        affectsElo: row.affectsElo !== 0
      })) as Tournament[];
    },
    findActive: async (): Promise<Tournament[]> => {
      await ensureInit();
      const result = await client.execute("SELECT * FROM tournaments WHERE status = 'active' ORDER BY createdAt DESC");
      return result.rows.map((row: any) => ({
        ...row,
        bracketType: row.bracketType || 'single',
        bracketReset: Boolean(row.bracketReset),
        affectsElo: row.affectsElo !== 0
      })) as Tournament[];
    },
    findCompleted: async (): Promise<Tournament[]> => {
      await ensureInit();
      const result = await client.execute("SELECT * FROM tournaments WHERE status = 'completed' ORDER BY completedAt DESC");
      return result.rows.map((row: any) => ({
        ...row,
        bracketType: row.bracketType || 'single',
        bracketReset: Boolean(row.bracketReset),
        affectsElo: row.affectsElo !== 0
      })) as Tournament[];
    },
    findById: async (id: number): Promise<Tournament | undefined> => {
      await ensureInit();
      const result = await client.execute({
        sql: 'SELECT * FROM tournaments WHERE id = ?',
        args: [id]
      });
      if (!result.rows[0]) return undefined;
      const row = result.rows[0] as any;
      return {
        ...row,
        bracketType: row.bracketType || 'single',
        bracketReset: Boolean(row.bracketReset),
        affectsElo: row.affectsElo !== 0
      } as Tournament;
    },
    create: async (tournament: { name: string; size: number; createdBy: number; bracketType?: 'single' | 'double'; bracketReset?: boolean; affectsElo?: boolean }): Promise<Tournament> => {
      await ensureInit();
      const result = await client.execute({
        sql: 'INSERT INTO tournaments (name, size, createdBy, bracketType, bracketReset, affectsElo) VALUES (?, ?, ?, ?, ?, ?) RETURNING *',
        args: [
          tournament.name,
          tournament.size,
          tournament.createdBy,
          tournament.bracketType || 'single',
          tournament.bracketReset !== false ? 1 : 0,
          tournament.affectsElo !== false ? 1 : 0
        ]
      });
      const row = result.rows[0] as any;
      return {
        ...row,
        bracketReset: Boolean(row.bracketReset),
        affectsElo: row.affectsElo !== 0
      } as Tournament;
    },
    update: async (id: number, updates: Partial<Tournament>) => {
      await ensureInit();
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.status !== undefined) {
        fields.push('status = ?');
        values.push(updates.status);
      }
      if (updates.winnerId !== undefined) {
        fields.push('winnerId = ?');
        values.push(updates.winnerId);
      }
      if (updates.completedAt !== undefined) {
        fields.push('completedAt = ?');
        values.push(updates.completedAt);
      }

      if (fields.length > 0) {
        values.push(id);
        await client.execute({
          sql: `UPDATE tournaments SET ${fields.join(', ')} WHERE id = ?`,
          args: values
        });
      }
    },
    delete: async (id: number) => {
      await ensureInit();
      await client.execute({
        sql: 'DELETE FROM tournament_matches WHERE tournamentId = ?',
        args: [id]
      });
      await client.execute({
        sql: 'DELETE FROM tournaments WHERE id = ?',
        args: [id]
      });
    }
  },

  tournamentMatches: {
    findByTournamentId: async (tournamentId: number): Promise<TournamentMatch[]> => {
      await ensureInit();
      const result = await client.execute({
        sql: 'SELECT * FROM tournament_matches WHERE tournamentId = ? ORDER BY bracket ASC, round DESC, position ASC',
        args: [tournamentId]
      });
      return result.rows.map((row: any) => ({
        ...row,
        bracket: row.bracket || 'winners'
      })) as TournamentMatch[];
    },
    findById: async (id: number): Promise<TournamentMatch | undefined> => {
      await ensureInit();
      const result = await client.execute({
        sql: 'SELECT * FROM tournament_matches WHERE id = ?',
        args: [id]
      });
      if (!result.rows[0]) return undefined;
      const row = result.rows[0] as any;
      return {
        ...row,
        bracket: row.bracket || 'winners'
      } as TournamentMatch;
    },
    create: async (match: Omit<TournamentMatch, 'id'>): Promise<TournamentMatch> => {
      await ensureInit();
      const result = await client.execute({
        sql: 'INSERT INTO tournament_matches (tournamentId, bracket, round, position, player1Id, player2Id, winnerId, matchId, playedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *',
        args: [
          match.tournamentId,
          match.bracket || 'winners',
          match.round,
          match.position,
          match.player1Id,
          match.player2Id,
          match.winnerId,
          match.matchId,
          match.playedAt
        ]
      });
      const row = result.rows[0] as any;
      return {
        ...row,
        bracket: row.bracket || 'winners'
      } as TournamentMatch;
    },
    update: async (id: number, updates: Partial<TournamentMatch>) => {
      await ensureInit();
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.player1Id !== undefined) {
        fields.push('player1Id = ?');
        values.push(updates.player1Id);
      }
      if (updates.player2Id !== undefined) {
        fields.push('player2Id = ?');
        values.push(updates.player2Id);
      }
      if (updates.winnerId !== undefined) {
        fields.push('winnerId = ?');
        values.push(updates.winnerId);
      }
      if (updates.matchId !== undefined) {
        fields.push('matchId = ?');
        values.push(updates.matchId);
      }
      if (updates.playedAt !== undefined) {
        fields.push('playedAt = ?');
        values.push(updates.playedAt);
      }

      if (fields.length > 0) {
        values.push(id);
        await client.execute({
          sql: `UPDATE tournament_matches SET ${fields.join(', ')} WHERE id = ?`,
          args: values
        });
      }
    },
    findByRoundAndPosition: async (tournamentId: number, round: number, position: number, bracket: string = 'winners'): Promise<TournamentMatch | undefined> => {
      await ensureInit();
      const result = await client.execute({
        sql: 'SELECT * FROM tournament_matches WHERE tournamentId = ? AND bracket = ? AND round = ? AND position = ?',
        args: [tournamentId, bracket, round, position]
      });
      if (!result.rows[0]) return undefined;
      const row = result.rows[0] as any;
      return {
        ...row,
        bracket: row.bracket || 'winners'
      } as TournamentMatch;
    },
    findByBracket: async (tournamentId: number, bracket: string): Promise<TournamentMatch[]> => {
      await ensureInit();
      const result = await client.execute({
        sql: 'SELECT * FROM tournament_matches WHERE tournamentId = ? AND bracket = ? ORDER BY round DESC, position ASC',
        args: [tournamentId, bracket]
      });
      return result.rows.map((row: any) => ({
        ...row,
        bracket: row.bracket || 'winners'
      })) as TournamentMatch[];
    }
  }
};

// Type exports
export type { User, Match, MatchParticipant, Tournament, TournamentMatch };
export type Player = User;
