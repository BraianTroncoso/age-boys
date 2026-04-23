/**
 * Seed script: populates Firestore + Firebase Auth with recovered data.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Requires .firebase-service-account.json in project root
 * or FIREBASE_SERVICE_ACCOUNT env var.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// --- Init Firebase Admin ---
function loadServiceAccount() {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (inline) return JSON.parse(inline);
  const path = resolve(process.cwd(), '.firebase-service-account.json');
  return JSON.parse(readFileSync(path, 'utf-8'));
}

const app = getApps().length === 0
  ? initializeApp({ credential: cert(loadServiceAccount()) })
  : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);

// --- Data ---
const users = [
  { oldId: '1', username: 'admin', email: 'admin@ageboys.app', password: 'Admin123!', favoriteCiv: 'spanish', eloRating: 1000, eloTeams: 1000, eloFfa: 1000, isAdmin: true },
  { oldId: '2', username: 'BRA1AN', email: 'braian@ageboys.app', password: 'Age2025!', favoriteCiv: 'british', eloRating: 913, eloTeams: 985, eloFfa: 991, isAdmin: false },
  { oldId: '3', username: 'Papadesytu', email: 'luciano@ageboys.app', password: 'Age2025!', favoriteCiv: 'hausa', eloRating: 1024, eloTeams: 1001, eloFfa: 991, isAdmin: false },
  { oldId: '4', username: 'Dr Feelgood', email: 'david@ageboys.app', password: 'Age2025!', favoriteCiv: 'ottomans', eloRating: 1038, eloTeams: 1000, eloFfa: 991, isAdmin: false },
  { oldId: '5', username: 'Hanamichi', email: 'hanamichi@ageboys.app', password: 'Age2025!', favoriteCiv: 'germans', eloRating: 1000, eloTeams: 1047, eloFfa: 998, isAdmin: false },
  { oldId: '6', username: 'Jma96', email: 'chino@ageboys.app', password: 'Age2025!', favoriteCiv: 'dutch', eloRating: 1000, eloTeams: 953, eloFfa: 994, isAdmin: false },
  { oldId: '7', username: 'Tincke10', email: 'martin@ageboys.app', password: 'Age2025!', favoriteCiv: 'mexicans', eloRating: 1040, eloTeams: 999, eloFfa: 1031, isAdmin: false },
  { oldId: '8', username: 'Jugador8', email: 'jugador8@ageboys.app', password: 'Age2025!', favoriteCiv: 'british', eloRating: 1000, eloTeams: 1000, eloFfa: 995, isAdmin: false },
  { oldId: '9', username: 'LordValdomero', email: 'mauricio@ageboys.app', password: 'Age2025!', favoriteCiv: 'portuguese', eloRating: 985, eloTeams: 1000, eloFfa: 1015, isAdmin: false },
  { oldId: '10', username: 'Jugador10', email: 'jugador10@ageboys.app', password: 'Age2025!', favoriteCiv: 'ottomans', eloRating: 1000, eloTeams: 1015, eloFfa: 1000, isAdmin: false },
];

const matches = [
  { oldId: '1', matchType: '1v1', createdBy: '4', playedAt: '2025-12-10T00:01:39.000Z' },
  { oldId: '2', matchType: '2v2', createdBy: '1', playedAt: '2025-12-10T01:59:05.000Z' },
  { oldId: '4', matchType: '2v2', createdBy: '1', playedAt: '2025-12-10T03:09:26.000Z' },
  { oldId: '5', matchType: 'tournament_casual', createdBy: '4', playedAt: '2025-12-12T17:09:58.000Z' },
  { oldId: '6', matchType: 'tournament_casual', createdBy: '4', playedAt: '2025-12-12T17:10:05.000Z' },
  { oldId: '7', matchType: 'tournament_casual', createdBy: '4', playedAt: '2025-12-12T17:10:28.000Z' },
  { oldId: '8', matchType: 'ffa', createdBy: '2', playedAt: '2025-12-13T01:25:56.000Z' },
  { oldId: '9', matchType: 'tournament_casual', createdBy: '2', playedAt: '2025-12-13T01:57:32.000Z' },
  { oldId: '10', matchType: 'tournament_casual', createdBy: '2', playedAt: '2025-12-13T01:57:34.000Z' },
  { oldId: '11', matchType: 'tournament_casual', createdBy: '2', playedAt: '2025-12-13T01:57:38.000Z' },
  { oldId: '12', matchType: '1v1', createdBy: '4', playedAt: '2025-12-13T02:58:03.000Z' },
  { oldId: '13', matchType: '1v1', createdBy: '4', playedAt: '2025-12-13T03:00:05.000Z' },
  { oldId: '14', matchType: '1v1', createdBy: '3', playedAt: '2025-12-15T00:50:23.000Z' },
  { oldId: '15', matchType: '1v1', createdBy: '7', playedAt: '2025-12-15T00:56:00.000Z' },
  { oldId: '16', matchType: '1v1', createdBy: '7', playedAt: '2025-12-15T00:56:25.000Z' },
  { oldId: '17', matchType: '1v1', createdBy: '7', playedAt: '2025-12-15T00:56:50.000Z' },
  { oldId: '18', matchType: 'ffa', createdBy: '7', playedAt: '2025-12-15T02:22:17.000Z' },
  { oldId: '19', matchType: 'ffa', createdBy: '7', playedAt: '2025-12-16T02:30:52.000Z' },
  { oldId: '20', matchType: '1v1', createdBy: '3', playedAt: '2025-12-16T19:53:44.000Z' },
  { oldId: '21', matchType: '1v1', createdBy: '4', playedAt: '2025-12-16T19:59:57.000Z' },
  { oldId: '22', matchType: '1v1', createdBy: '7', playedAt: '2025-12-16T20:19:15.000Z' },
  { oldId: '23', matchType: '1v1', createdBy: '4', playedAt: '2025-12-16T20:42:56.000Z' },
  { oldId: '24', matchType: '2v2', createdBy: '2', playedAt: '2025-12-19T01:59:31.000Z' },
  { oldId: '25', matchType: '1v1', createdBy: '2', playedAt: '2025-12-19T02:55:39.000Z' },
  { oldId: '26', matchType: '3v3', createdBy: '7', playedAt: '2025-12-19T04:06:40.000Z' },
  { oldId: '27', matchType: '1v1', createdBy: '4', playedAt: '2025-12-24T18:43:27.000Z' },
  { oldId: '28', matchType: '1v1', createdBy: '4', playedAt: '2025-12-24T18:43:46.000Z' },
  { oldId: '29', matchType: '1v1', createdBy: '4', playedAt: '2026-01-19T13:51:08.000Z' },
  { oldId: '30', matchType: '2v2', createdBy: '4', playedAt: '2026-01-19T13:53:08.000Z' },
];

// Participants grouped by matchOldId
const participantsByMatch: Record<string, Array<{ playerId: string; team: number | null; civilization: string; isWinner: boolean; eloChange: number }>> = {
  '1': [
    { playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 16 },
    { playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -16 },
  ],
  '2': [
    { playerId: '3', team: 1, civilization: 'japanese', isWinner: true, eloChange: 16 },
    { playerId: '6', team: 2, civilization: 'dutch', isWinner: false, eloChange: -16 },
    { playerId: '5', team: 1, civilization: 'germans', isWinner: true, eloChange: 16 },
    { playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -16 },
  ],
  '4': [
    { playerId: '4', team: 1, civilization: 'ottomans', isWinner: false, eloChange: -18 },
    { playerId: '6', team: 2, civilization: 'dutch', isWinner: true, eloChange: 18 },
    { playerId: '3', team: 1, civilization: 'japanese', isWinner: false, eloChange: -18 },
    { playerId: '5', team: 2, civilization: 'germans', isWinner: true, eloChange: 18 },
  ],
  '5': [
    { playerId: '2', team: 1, civilization: 'british', isWinner: true, eloChange: 0 },
    { playerId: '3', team: 2, civilization: 'hausa', isWinner: false, eloChange: 0 },
  ],
  '6': [
    { playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 0 },
    { playerId: '5', team: 2, civilization: 'germans', isWinner: false, eloChange: 0 },
  ],
  '7': [
    { playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 0 },
    { playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: 0 },
  ],
  '8': [
    { playerId: '9', team: null, civilization: 'portuguese', isWinner: true, eloChange: 15 },
    { playerId: '4', team: null, civilization: 'ottomans', isWinner: false, eloChange: -3 },
    { playerId: '3', team: null, civilization: 'hausa', isWinner: false, eloChange: -3 },
    { playerId: '7', team: null, civilization: 'mexicans', isWinner: false, eloChange: -3 },
    { playerId: '8', team: null, civilization: 'british', isWinner: false, eloChange: -3 },
    { playerId: '2', team: null, civilization: 'british', isWinner: false, eloChange: -3 },
  ],
  '9': [
    { playerId: '8', team: 1, civilization: 'british', isWinner: true, eloChange: 0 },
    { playerId: '4', team: 2, civilization: 'ottomans', isWinner: false, eloChange: 0 },
  ],
  '10': [
    { playerId: '7', team: 1, civilization: 'mexicans', isWinner: true, eloChange: 0 },
    { playerId: '3', team: 2, civilization: 'hausa', isWinner: false, eloChange: 0 },
  ],
  '11': [
    { playerId: '8', team: 1, civilization: 'british', isWinner: true, eloChange: 0 },
    { playerId: '7', team: 2, civilization: 'mexicans', isWinner: false, eloChange: 0 },
  ],
  '12': [
    { playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 15 },
    { playerId: '9', team: 2, civilization: 'portuguese', isWinner: false, eloChange: -15 },
  ],
  '13': [
    { playerId: '3', team: 1, civilization: 'hausa', isWinner: true, eloChange: 15 },
    { playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -15 },
  ],
  '14': [
    { playerId: '3', team: 1, civilization: 'hausa', isWinner: true, eloChange: 14 },
    { playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -14 },
  ],
  '15': [
    { playerId: '7', team: 1, civilization: 'mexicans', isWinner: true, eloChange: 17 },
    { playerId: '4', team: 2, civilization: 'ottomans', isWinner: false, eloChange: -17 },
  ],
  '16': [
    { playerId: '7', team: 1, civilization: 'mexicans', isWinner: true, eloChange: 16 },
    { playerId: '4', team: 2, civilization: 'ottomans', isWinner: false, eloChange: -16 },
  ],
  '17': [
    { playerId: '7', team: 1, civilization: 'mexicans', isWinner: true, eloChange: 14 },
    { playerId: '4', team: 2, civilization: 'ottomans', isWinner: false, eloChange: -14 },
  ],
  '18': [
    { playerId: '7', team: null, civilization: 'mexicans', isWinner: true, eloChange: 16 },
    { playerId: '3', team: null, civilization: 'hausa', isWinner: false, eloChange: -4 },
    { playerId: '6', team: null, civilization: 'dutch', isWinner: false, eloChange: -4 },
    { playerId: '4', team: null, civilization: 'ottomans', isWinner: false, eloChange: -4 },
    { playerId: '2', team: null, civilization: 'british', isWinner: false, eloChange: -4 },
  ],
  '19': [
    { playerId: '7', team: null, civilization: 'mexicans', isWinner: true, eloChange: 18 },
    { playerId: '3', team: null, civilization: 'hausa', isWinner: false, eloChange: -2 },
    { playerId: '5', team: null, civilization: 'germans', isWinner: false, eloChange: -2 },
    { playerId: '6', team: null, civilization: 'dutch', isWinner: false, eloChange: -2 },
    { playerId: '8', team: null, civilization: 'british', isWinner: false, eloChange: -2 },
    { playerId: '4', team: null, civilization: 'ottomans', isWinner: false, eloChange: -2 },
    { playerId: '2', team: null, civilization: 'british', isWinner: false, eloChange: -2 },
  ],
  '20': [
    { playerId: '3', team: 1, civilization: 'hausa', isWinner: true, eloChange: 13 },
    { playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -13 },
  ],
  '21': [
    { playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 19 },
    { playerId: '7', team: 2, civilization: 'mexicans', isWinner: false, eloChange: -19 },
  ],
  '22': [
    { playerId: '7', team: 1, civilization: 'mexicans', isWinner: true, eloChange: 12 },
    { playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -12 },
  ],
  '23': [
    { playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 18 },
    { playerId: '3', team: 2, civilization: 'hausa', isWinner: false, eloChange: -18 },
  ],
  '24': [
    { playerId: '2', team: 1, civilization: 'british', isWinner: true, eloChange: 16 },
    { playerId: '7', team: 2, civilization: 'mexicans', isWinner: false, eloChange: -16 },
    { playerId: '5', team: 1, civilization: 'germans', isWinner: true, eloChange: 16 },
    { playerId: '6', team: 2, civilization: 'dutch', isWinner: false, eloChange: -16 },
  ],
  '25': [
    { playerId: '2', team: 1, civilization: 'british', isWinner: true, eloChange: 20 },
    { playerId: '4', team: 2, civilization: 'ottomans', isWinner: false, eloChange: -20 },
  ],
  '26': [
    { playerId: '7', team: 1, civilization: 'mexicans', isWinner: true, eloChange: 15 },
    { playerId: '3', team: 2, civilization: 'hausa', isWinner: false, eloChange: -15 },
    { playerId: '5', team: 1, civilization: 'germans', isWinner: true, eloChange: 15 },
    { playerId: '6', team: 2, civilization: 'dutch', isWinner: false, eloChange: -15 },
    { playerId: '10', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 15 },
    { playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -15 },
  ],
  '27': [
    { playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 14 },
    { playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -14 },
  ],
  '28': [
    { playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 12 },
    { playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -12 },
  ],
  '29': [
    { playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 11 },
    { playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -11 },
  ],
  '30': [
    { playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 18 },
    { playerId: '5', team: 2, civilization: 'germans', isWinner: false, eloChange: -18 },
    { playerId: '3', team: 1, civilization: 'hausa', isWinner: true, eloChange: 18 },
    { playerId: '6', team: 2, civilization: 'dutch', isWinner: false, eloChange: -18 },
  ],
};

const tournaments = [
  { oldId: '3', name: 'Copa Navidad', size: 4, status: 'completed', winnerId: '4', createdBy: '4', createdAt: '2025-12-12T17:09:13.000Z', completedAt: '2025-12-12T17:10:28.520Z', bracketType: 'single', bracketReset: true, affectsElo: false },
  { oldId: '4', name: 'Copa de leche', size: 6, status: 'active', winnerId: null, createdBy: '2', createdAt: '2025-12-13T01:43:20.000Z', completedAt: null, bracketType: 'double', bracketReset: false, affectsElo: true },
  { oldId: '8', name: 'Copa test', size: 4, status: 'completed', winnerId: '8', createdBy: '2', createdAt: '2025-12-13T01:57:28.000Z', completedAt: '2025-12-13T01:57:38.859Z', bracketType: 'single', bracketReset: true, affectsElo: false },
  { oldId: '9', name: 'Copa 12/12', size: 6, status: 'active', winnerId: null, createdBy: '2', createdAt: '2025-12-13T02:05:39.000Z', completedAt: null, bracketType: 'double', bracketReset: false, affectsElo: true },
];

const tournamentMatches = [
  { tournamentOldId: '3', round: 2, position: 0, player1Id: '2', player2Id: '3', winnerId: '2', matchOldId: '5', playedAt: '2025-12-12T17:09:58.721Z', bracket: 'winners' },
  { tournamentOldId: '3', round: 2, position: 1, player1Id: '4', player2Id: '5', winnerId: '4', matchOldId: '6', playedAt: '2025-12-12T17:10:05.904Z', bracket: 'winners' },
  { tournamentOldId: '3', round: 1, position: 0, player1Id: '2', player2Id: '4', winnerId: '4', matchOldId: '7', playedAt: '2025-12-12T17:10:28.490Z', bracket: 'winners' },
  { tournamentOldId: '4', round: 2.584962500721156, position: 0, player1Id: '2', player2Id: '3', winnerId: null, matchOldId: null, playedAt: null, bracket: 'winners' },
  { tournamentOldId: '4', round: 2.584962500721156, position: 1, player1Id: '7', player2Id: '9', winnerId: null, matchOldId: null, playedAt: null, bracket: 'winners' },
  { tournamentOldId: '4', round: 2.584962500721156, position: 2, player1Id: '4', player2Id: '5', winnerId: null, matchOldId: null, playedAt: null, bracket: 'winners' },
  { tournamentOldId: '4', round: 1.584962500721156, position: 0, player1Id: null, player2Id: null, winnerId: null, matchOldId: null, playedAt: null, bracket: 'winners' },
  { tournamentOldId: '4', round: 1.584962500721156, position: 1, player1Id: null, player2Id: null, winnerId: null, matchOldId: null, playedAt: null, bracket: 'winners' },
  { tournamentOldId: '4', round: 3.169925001442312, position: 0, player1Id: null, player2Id: null, winnerId: null, matchOldId: null, playedAt: null, bracket: 'losers' },
  { tournamentOldId: '4', round: 3.169925001442312, position: 1, player1Id: null, player2Id: null, winnerId: null, matchOldId: null, playedAt: null, bracket: 'losers' },
  { tournamentOldId: '4', round: 2.169925001442312, position: 0, player1Id: null, player2Id: null, winnerId: null, matchOldId: null, playedAt: null, bracket: 'losers' },
  { tournamentOldId: '4', round: 1.1699250014423122, position: 0, player1Id: null, player2Id: null, winnerId: null, matchOldId: null, playedAt: null, bracket: 'losers' },
  { tournamentOldId: '4', round: 1, position: 0, player1Id: null, player2Id: null, winnerId: null, matchOldId: null, playedAt: null, bracket: 'grand_final' },
  { tournamentOldId: '8', round: 2, position: 0, player1Id: '8', player2Id: '4', winnerId: '8', matchOldId: '9', playedAt: '2025-12-13T01:57:32.502Z', bracket: 'winners' },
  { tournamentOldId: '8', round: 2, position: 1, player1Id: '3', player2Id: '7', winnerId: '7', matchOldId: '10', playedAt: '2025-12-13T01:57:34.838Z', bracket: 'winners' },
  { tournamentOldId: '8', round: 1, position: 0, player1Id: '8', player2Id: '7', winnerId: '8', matchOldId: '11', playedAt: '2025-12-13T01:57:38.832Z', bracket: 'winners' },
];

// --- Seed functions ---
async function seedUsers() {
  console.log('\n--- Seeding Users ---');
  const oldToNew = new Map<string, string>();

  for (const u of users) {
    try {
      let firebaseUser;
      try {
        firebaseUser = await auth.getUserByEmail(u.email);
        console.log(`  [EXISTS] ${u.username} (${firebaseUser.uid})`);
      } catch {
        firebaseUser = await auth.createUser({
          email: u.email,
          password: u.password,
          displayName: u.username,
        });
        console.log(`  [CREATED] ${u.username} (${firebaseUser.uid})`);
      }

      oldToNew.set(u.oldId, firebaseUser.uid);

      await db.collection('users').doc(firebaseUser.uid).set({
        username: u.username,
        email: u.email,
        favoriteCiv: u.favoriteCiv,
        eloRating: u.eloRating,
        eloTeams: u.eloTeams,
        eloFfa: u.eloFfa,
        isAdmin: u.isAdmin,
        createdAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    } catch (err: any) {
      console.error(`  [ERROR] ${u.username}:`, err.message);
    }
  }
  return oldToNew;
}

async function seedMatches(userMap: Map<string, string>) {
  console.log('\n--- Seeding Matches ---');
  const matchOldToNew = new Map<string, string>();
  const uid = (oldId: string) => userMap.get(oldId) || oldId;
  const uname = (oldId: string) => users.find(u => u.oldId === oldId)?.username || 'Unknown';

  for (const m of matches) {
    const participants = (participantsByMatch[m.oldId] || []).map(p => ({
      playerId: uid(p.playerId),
      playerName: uname(p.playerId),
      team: p.team,
      civilization: p.civilization,
      isWinner: p.isWinner,
      eloChange: p.eloChange,
    }));

    const playerIds = [...new Set(participants.map(p => p.playerId))];

    const ref = await db.collection('matches').add({
      matchType: m.matchType,
      createdBy: uid(m.createdBy),
      creatorName: uname(m.createdBy),
      playedAt: new Date(m.playedAt),
      createdAt: new Date(m.playedAt),
      playerIds,
      participants,
    });

    matchOldToNew.set(m.oldId, ref.id);
    console.log(`  [OK] Match ${m.oldId} → ${ref.id} (${m.matchType}, ${participants.length} players)`);
  }
  return matchOldToNew;
}

async function seedTournaments(userMap: Map<string, string>, matchMap: Map<string, string>) {
  console.log('\n--- Seeding Tournaments ---');
  const tournamentOldToNew = new Map<string, string>();
  const uid = (oldId: string | null) => oldId ? (userMap.get(oldId) || oldId) : null;

  for (const t of tournaments) {
    const ref = await db.collection('tournaments').add({
      name: t.name,
      size: t.size,
      status: t.status,
      bracketType: t.bracketType,
      bracketReset: t.bracketReset,
      affectsElo: t.affectsElo,
      winnerId: uid(t.winnerId),
      createdBy: uid(t.createdBy) || '',
      createdAt: new Date(t.createdAt),
      completedAt: t.completedAt ? new Date(t.completedAt) : null,
    });
    tournamentOldToNew.set(t.oldId, ref.id);
    console.log(`  [OK] Tournament "${t.name}" → ${ref.id}`);
  }

  console.log('\n--- Seeding Tournament Matches ---');
  for (const tm of tournamentMatches) {
    const tournamentId = tournamentOldToNew.get(tm.tournamentOldId);
    if (!tournamentId) { console.log(`  [SKIP] Tournament ${tm.tournamentOldId} not found`); continue; }

    await db.collection('tournamentMatches').add({
      tournamentId,
      round: tm.round,
      position: tm.position,
      bracket: tm.bracket,
      player1Id: uid(tm.player1Id),
      player2Id: uid(tm.player2Id),
      winnerId: uid(tm.winnerId),
      matchId: tm.matchOldId ? (matchMap.get(tm.matchOldId) || null) : null,
      playedAt: tm.playedAt ? new Date(tm.playedAt) : null,
    });
  }
  console.log(`  [OK] ${tournamentMatches.length} tournament matches seeded`);
}

// --- Main ---
async function main() {
  console.log('🏰 AoE3 Tracker - Firebase Seed');
  console.log('================================\n');

  const userMap = await seedUsers();
  const matchMap = await seedMatches(userMap);
  await seedTournaments(userMap, matchMap);

  console.log('\n================================');
  console.log('Seed complete!');
  console.log(`  Users: ${users.length}`);
  console.log(`  Matches: ${matches.length}`);
  console.log(`  Tournaments: ${tournaments.length}`);
  console.log(`  Tournament matches: ${tournamentMatches.length}`);
  console.log('\nOld ID → Firebase UID mapping:');
  for (const [old, uid] of userMap) {
    const u = users.find(x => x.oldId === old);
    console.log(`  ${old} (${u?.username}) → ${uid}`);
  }
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
