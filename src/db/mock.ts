// Real data from Turso DB + CSVs, used as fallback when DB queries fail
import type { User, Match, MatchParticipant, Tournament, TournamentMatch } from './index';

export const mockUsers: User[] = [
  { id: '1', username: 'admin', favoriteCiv: 'spanish', eloRating: 1000, eloTeams: 1000, eloFfa: 1000, isAdmin: true, createdAt: '2025-12-01' },
  { id: '2', username: 'BRA1AN', favoriteCiv: 'british', eloRating: 913, eloTeams: 985, eloFfa: 991, isAdmin: false, createdAt: '2025-12-01' },
  { id: '3', username: 'Papadesytu', favoriteCiv: 'hausa', eloRating: 1024, eloTeams: 1001, eloFfa: 991, isAdmin: false, createdAt: '2025-12-01' },
  { id: '4', username: 'Dr Feelgood', favoriteCiv: 'ottomans', eloRating: 1038, eloTeams: 1000, eloFfa: 991, isAdmin: false, createdAt: '2025-12-01' },
  { id: '5', username: 'Hanamichi', favoriteCiv: 'germans', eloRating: 1000, eloTeams: 1047, eloFfa: 998, isAdmin: false, createdAt: '2025-12-01' },
  { id: '6', username: 'Jma96', favoriteCiv: 'dutch', eloRating: 1000, eloTeams: 953, eloFfa: 994, isAdmin: false, createdAt: '2025-12-01' },
  { id: '7', username: 'Tincke10', favoriteCiv: 'mexicans', eloRating: 1040, eloTeams: 999, eloFfa: 1031, isAdmin: false, createdAt: '2025-12-01' },
  { id: '8', username: 'Jugador8', favoriteCiv: 'british', eloRating: 1000, eloTeams: 1000, eloFfa: 995, isAdmin: false, createdAt: '2025-12-01' },
  { id: '9', username: 'LordValdomero', favoriteCiv: 'portuguese', eloRating: 985, eloTeams: 1000, eloFfa: 1015, isAdmin: false, createdAt: '2025-12-01' },
  { id: '10', username: 'Jugador10', favoriteCiv: 'ottomans', eloRating: 1000, eloTeams: 1015, eloFfa: 1000, isAdmin: false, createdAt: '2025-12-01' },
];

const userMap = new Map(mockUsers.map(u => [u.id, u]));
const userName = (id: string) => userMap.get(id)?.username || 'Unknown';

export const mockMatches: Match[] = [
  { id: '1', matchType: '1v1', createdBy: '4', playedAt: '2025-12-10 00:01:39', createdAt: '2025-12-10 00:01:39' },
  { id: '2', matchType: '2v2', createdBy: '1', playedAt: '2025-12-10 01:59:05', createdAt: '2025-12-10 01:59:05' },
  { id: '4', matchType: '2v2', createdBy: '1', playedAt: '2025-12-10 03:09:26', createdAt: '2025-12-10 03:09:26' },
  { id: '5', matchType: 'tournament_casual', createdBy: '4', playedAt: '2025-12-12 17:09:58', createdAt: '2025-12-12 17:09:58' },
  { id: '6', matchType: 'tournament_casual', createdBy: '4', playedAt: '2025-12-12 17:10:05', createdAt: '2025-12-12 17:10:05' },
  { id: '7', matchType: 'tournament_casual', createdBy: '4', playedAt: '2025-12-12 17:10:28', createdAt: '2025-12-12 17:10:28' },
  { id: '8', matchType: 'ffa', createdBy: '2', playedAt: '2025-12-13 01:25:56', createdAt: '2025-12-13 01:25:56' },
  { id: '9', matchType: 'tournament_casual', createdBy: '2', playedAt: '2025-12-13 01:57:32', createdAt: '2025-12-13 01:57:32' },
  { id: '10', matchType: 'tournament_casual', createdBy: '2', playedAt: '2025-12-13 01:57:34', createdAt: '2025-12-13 01:57:34' },
  { id: '11', matchType: 'tournament_casual', createdBy: '2', playedAt: '2025-12-13 01:57:38', createdAt: '2025-12-13 01:57:38' },
  { id: '12', matchType: '1v1', createdBy: '4', playedAt: '2025-12-13 02:58:03', createdAt: '2025-12-13 02:58:03' },
  { id: '13', matchType: '1v1', createdBy: '4', playedAt: '2025-12-13 03:00:05', createdAt: '2025-12-13 03:00:05' },
  { id: '14', matchType: '1v1', createdBy: '3', playedAt: '2025-12-15 00:50:23', createdAt: '2025-12-15 00:50:23' },
  { id: '15', matchType: '1v1', createdBy: '7', playedAt: '2025-12-15 00:56:00', createdAt: '2025-12-15 00:56:00' },
  { id: '16', matchType: '1v1', createdBy: '7', playedAt: '2025-12-15 00:56:25', createdAt: '2025-12-15 00:56:25' },
  { id: '17', matchType: '1v1', createdBy: '7', playedAt: '2025-12-15 00:56:50', createdAt: '2025-12-15 00:56:50' },
  { id: '18', matchType: 'ffa', createdBy: '7', playedAt: '2025-12-15 02:22:17', createdAt: '2025-12-15 02:22:17' },
  { id: '19', matchType: 'ffa', createdBy: '7', playedAt: '2025-12-16 02:30:52', createdAt: '2025-12-16 02:30:52' },
  { id: '20', matchType: '1v1', createdBy: '3', playedAt: '2025-12-16 19:53:44', createdAt: '2025-12-16 19:53:44' },
  { id: '21', matchType: '1v1', createdBy: '4', playedAt: '2025-12-16 19:59:57', createdAt: '2025-12-16 19:59:57' },
  { id: '22', matchType: '1v1', createdBy: '7', playedAt: '2025-12-16 20:19:15', createdAt: '2025-12-16 20:19:15' },
  { id: '23', matchType: '1v1', createdBy: '4', playedAt: '2025-12-16 20:42:56', createdAt: '2025-12-16 20:42:56' },
  { id: '24', matchType: '2v2', createdBy: '2', playedAt: '2025-12-19 01:59:31', createdAt: '2025-12-19 01:59:31' },
  { id: '25', matchType: '1v1', createdBy: '2', playedAt: '2025-12-19 02:55:39', createdAt: '2025-12-19 02:55:39' },
  { id: '26', matchType: '3v3', createdBy: '7', playedAt: '2025-12-19 04:06:40', createdAt: '2025-12-19 04:06:40' },
  { id: '27', matchType: '1v1', createdBy: '4', playedAt: '2025-12-24 18:43:27', createdAt: '2025-12-24 18:43:27' },
  { id: '28', matchType: '1v1', createdBy: '4', playedAt: '2025-12-24 18:43:46', createdAt: '2025-12-24 18:43:46' },
  { id: '29', matchType: '1v1', createdBy: '4', playedAt: '2026-01-19 13:51:08', createdAt: '2026-01-19 13:51:08' },
  { id: '30', matchType: '2v2', createdBy: '4', playedAt: '2026-01-19 13:53:08', createdAt: '2026-01-19 13:53:08' },
];

// Real match_participants from Turso DB
export const mockParticipants: MatchParticipant[] = [
  { id: '1', matchId: '1', playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 16 },
  { id: '2', matchId: '1', playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -16 },
  { id: '3', matchId: '2', playerId: '3', team: 1, civilization: 'japanese', isWinner: true, eloChange: 16 },
  { id: '4', matchId: '2', playerId: '6', team: 2, civilization: 'dutch', isWinner: false, eloChange: -16 },
  { id: '5', matchId: '2', playerId: '5', team: 1, civilization: 'germans', isWinner: true, eloChange: 16 },
  { id: '6', matchId: '2', playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -16 },
  { id: '11', matchId: '4', playerId: '4', team: 1, civilization: 'ottomans', isWinner: false, eloChange: -18 },
  { id: '12', matchId: '4', playerId: '6', team: 2, civilization: 'dutch', isWinner: true, eloChange: 18 },
  { id: '13', matchId: '4', playerId: '3', team: 1, civilization: 'japanese', isWinner: false, eloChange: -18 },
  { id: '14', matchId: '4', playerId: '5', team: 2, civilization: 'germans', isWinner: true, eloChange: 18 },
  { id: '15', matchId: '5', playerId: '2', team: 1, civilization: 'british', isWinner: true, eloChange: 0 },
  { id: '16', matchId: '5', playerId: '3', team: 2, civilization: 'hausa', isWinner: false, eloChange: 0 },
  { id: '17', matchId: '6', playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 0 },
  { id: '18', matchId: '6', playerId: '5', team: 2, civilization: 'germans', isWinner: false, eloChange: 0 },
  { id: '19', matchId: '7', playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 0 },
  { id: '20', matchId: '7', playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: 0 },
  { id: '21', matchId: '8', playerId: '9', team: null, civilization: 'portuguese', isWinner: true, eloChange: 15 },
  { id: '22', matchId: '8', playerId: '4', team: null, civilization: 'ottomans', isWinner: false, eloChange: -3 },
  { id: '23', matchId: '8', playerId: '3', team: null, civilization: 'hausa', isWinner: false, eloChange: -3 },
  { id: '24', matchId: '8', playerId: '7', team: null, civilization: 'mexicans', isWinner: false, eloChange: -3 },
  { id: '25', matchId: '8', playerId: '8', team: null, civilization: 'british', isWinner: false, eloChange: -3 },
  { id: '26', matchId: '8', playerId: '2', team: null, civilization: 'british', isWinner: false, eloChange: -3 },
  { id: '27', matchId: '9', playerId: '8', team: 1, civilization: 'british', isWinner: true, eloChange: 0 },
  { id: '28', matchId: '9', playerId: '4', team: 2, civilization: 'ottomans', isWinner: false, eloChange: 0 },
  { id: '29', matchId: '10', playerId: '7', team: 1, civilization: 'mexicans', isWinner: true, eloChange: 0 },
  { id: '30', matchId: '10', playerId: '3', team: 2, civilization: 'hausa', isWinner: false, eloChange: 0 },
  { id: '31', matchId: '11', playerId: '8', team: 1, civilization: 'british', isWinner: true, eloChange: 0 },
  { id: '32', matchId: '11', playerId: '7', team: 2, civilization: 'mexicans', isWinner: false, eloChange: 0 },
  { id: '33', matchId: '12', playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 15 },
  { id: '34', matchId: '12', playerId: '9', team: 2, civilization: 'portuguese', isWinner: false, eloChange: -15 },
  { id: '35', matchId: '13', playerId: '3', team: 1, civilization: 'hausa', isWinner: true, eloChange: 15 },
  { id: '36', matchId: '13', playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -15 },
  { id: '37', matchId: '14', playerId: '3', team: 1, civilization: 'hausa', isWinner: true, eloChange: 14 },
  { id: '38', matchId: '14', playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -14 },
  { id: '39', matchId: '15', playerId: '7', team: 1, civilization: 'mexicans', isWinner: true, eloChange: 17 },
  { id: '40', matchId: '15', playerId: '4', team: 2, civilization: 'ottomans', isWinner: false, eloChange: -17 },
  { id: '41', matchId: '16', playerId: '7', team: 1, civilization: 'mexicans', isWinner: true, eloChange: 16 },
  { id: '42', matchId: '16', playerId: '4', team: 2, civilization: 'ottomans', isWinner: false, eloChange: -16 },
  { id: '43', matchId: '17', playerId: '7', team: 1, civilization: 'mexicans', isWinner: true, eloChange: 14 },
  { id: '44', matchId: '17', playerId: '4', team: 2, civilization: 'ottomans', isWinner: false, eloChange: -14 },
  { id: '45', matchId: '18', playerId: '7', team: null, civilization: 'mexicans', isWinner: true, eloChange: 16 },
  { id: '46', matchId: '18', playerId: '3', team: null, civilization: 'hausa', isWinner: false, eloChange: -4 },
  { id: '47', matchId: '18', playerId: '6', team: null, civilization: 'dutch', isWinner: false, eloChange: -4 },
  { id: '48', matchId: '18', playerId: '4', team: null, civilization: 'ottomans', isWinner: false, eloChange: -4 },
  { id: '49', matchId: '18', playerId: '2', team: null, civilization: 'british', isWinner: false, eloChange: -4 },
  { id: '50', matchId: '19', playerId: '7', team: null, civilization: 'mexicans', isWinner: true, eloChange: 18 },
  { id: '51', matchId: '19', playerId: '3', team: null, civilization: 'hausa', isWinner: false, eloChange: -2 },
  { id: '52', matchId: '19', playerId: '5', team: null, civilization: 'germans', isWinner: false, eloChange: -2 },
  { id: '53', matchId: '19', playerId: '6', team: null, civilization: 'dutch', isWinner: false, eloChange: -2 },
  { id: '54', matchId: '19', playerId: '8', team: null, civilization: 'british', isWinner: false, eloChange: -2 },
  { id: '55', matchId: '19', playerId: '4', team: null, civilization: 'ottomans', isWinner: false, eloChange: -2 },
  { id: '56', matchId: '19', playerId: '2', team: null, civilization: 'british', isWinner: false, eloChange: -2 },
  { id: '57', matchId: '20', playerId: '3', team: 1, civilization: 'hausa', isWinner: true, eloChange: 13 },
  { id: '58', matchId: '20', playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -13 },
  { id: '59', matchId: '21', playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 19 },
  { id: '60', matchId: '21', playerId: '7', team: 2, civilization: 'mexicans', isWinner: false, eloChange: -19 },
  { id: '61', matchId: '22', playerId: '7', team: 1, civilization: 'mexicans', isWinner: true, eloChange: 12 },
  { id: '62', matchId: '22', playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -12 },
  { id: '63', matchId: '23', playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 18 },
  { id: '64', matchId: '23', playerId: '3', team: 2, civilization: 'hausa', isWinner: false, eloChange: -18 },
  { id: '65', matchId: '24', playerId: '2', team: 1, civilization: 'british', isWinner: true, eloChange: 16 },
  { id: '66', matchId: '24', playerId: '7', team: 2, civilization: 'mexicans', isWinner: false, eloChange: -16 },
  { id: '67', matchId: '24', playerId: '5', team: 1, civilization: 'germans', isWinner: true, eloChange: 16 },
  { id: '68', matchId: '24', playerId: '6', team: 2, civilization: 'dutch', isWinner: false, eloChange: -16 },
  { id: '69', matchId: '25', playerId: '2', team: 1, civilization: 'british', isWinner: true, eloChange: 20 },
  { id: '70', matchId: '25', playerId: '4', team: 2, civilization: 'ottomans', isWinner: false, eloChange: -20 },
  { id: '71', matchId: '26', playerId: '7', team: 1, civilization: 'mexicans', isWinner: true, eloChange: 15 },
  { id: '72', matchId: '26', playerId: '3', team: 2, civilization: 'hausa', isWinner: false, eloChange: -15 },
  { id: '73', matchId: '26', playerId: '5', team: 1, civilization: 'germans', isWinner: true, eloChange: 15 },
  { id: '74', matchId: '26', playerId: '6', team: 2, civilization: 'dutch', isWinner: false, eloChange: -15 },
  { id: '75', matchId: '26', playerId: '10', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 15 },
  { id: '76', matchId: '26', playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -15 },
  { id: '77', matchId: '27', playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 14 },
  { id: '78', matchId: '27', playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -14 },
  { id: '79', matchId: '28', playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 12 },
  { id: '80', matchId: '28', playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -12 },
  { id: '81', matchId: '29', playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 11 },
  { id: '82', matchId: '29', playerId: '2', team: 2, civilization: 'british', isWinner: false, eloChange: -11 },
  { id: '83', matchId: '30', playerId: '4', team: 1, civilization: 'ottomans', isWinner: true, eloChange: 18 },
  { id: '84', matchId: '30', playerId: '5', team: 2, civilization: 'germans', isWinner: false, eloChange: -18 },
  { id: '85', matchId: '30', playerId: '3', team: 1, civilization: 'hausa', isWinner: true, eloChange: 18 },
  { id: '86', matchId: '30', playerId: '6', team: 2, civilization: 'dutch', isWinner: false, eloChange: -18 },
];

export const mockTournaments: Tournament[] = [
  { id: '3', name: 'Copa Navidad', size: 4, status: 'completed', winnerId: '4', createdBy: '4', createdAt: '2025-12-12 17:09:13', completedAt: '2025-12-12T17:10:28.520Z', bracketType: 'single', bracketReset: true, affectsElo: false },
  { id: '4', name: 'Copa de leche', size: 6, status: 'active', winnerId: null, createdBy: '2', createdAt: '2025-12-13 01:43:20', completedAt: null, bracketType: 'double', bracketReset: false, affectsElo: true },
  { id: '8', name: 'Copa test', size: 4, status: 'completed', winnerId: '8', createdBy: '2', createdAt: '2025-12-13 01:57:28', completedAt: '2025-12-13T01:57:38.859Z', bracketType: 'single', bracketReset: true, affectsElo: false },
  { id: '9', name: 'Copa 12/12', size: 6, status: 'active', winnerId: null, createdBy: '2', createdAt: '2025-12-13 02:05:39', completedAt: null, bracketType: 'double', bracketReset: false, affectsElo: true },
];

export const mockTournamentMatches: TournamentMatch[] = [
  { id: '7', tournamentId: '3', round: 2, position: 0, player1Id: '2', player2Id: '3', winnerId: '2', matchId: '5', playedAt: '2025-12-12T17:09:58.721Z', bracket: 'winners' },
  { id: '8', tournamentId: '3', round: 2, position: 1, player1Id: '4', player2Id: '5', winnerId: '4', matchId: '6', playedAt: '2025-12-12T17:10:05.904Z', bracket: 'winners' },
  { id: '9', tournamentId: '3', round: 1, position: 0, player1Id: '2', player2Id: '4', winnerId: '4', matchId: '7', playedAt: '2025-12-12T17:10:28.490Z', bracket: 'winners' },
  { id: '10', tournamentId: '4', round: 2.584962500721156, position: 0, player1Id: '2', player2Id: '3', winnerId: null, matchId: null, playedAt: null, bracket: 'winners' },
  { id: '11', tournamentId: '4', round: 2.584962500721156, position: 1, player1Id: '7', player2Id: '9', winnerId: null, matchId: null, playedAt: null, bracket: 'winners' },
  { id: '12', tournamentId: '4', round: 2.584962500721156, position: 2, player1Id: '4', player2Id: '5', winnerId: null, matchId: null, playedAt: null, bracket: 'winners' },
  { id: '13', tournamentId: '4', round: 1.584962500721156, position: 0, player1Id: null, player2Id: null, winnerId: null, matchId: null, playedAt: null, bracket: 'winners' },
  { id: '14', tournamentId: '4', round: 1.584962500721156, position: 1, player1Id: null, player2Id: null, winnerId: null, matchId: null, playedAt: null, bracket: 'winners' },
  { id: '15', tournamentId: '4', round: 3.169925001442312, position: 0, player1Id: null, player2Id: null, winnerId: null, matchId: null, playedAt: null, bracket: 'losers' },
  { id: '16', tournamentId: '4', round: 3.169925001442312, position: 1, player1Id: null, player2Id: null, winnerId: null, matchId: null, playedAt: null, bracket: 'losers' },
  { id: '17', tournamentId: '4', round: 2.169925001442312, position: 0, player1Id: null, player2Id: null, winnerId: null, matchId: null, playedAt: null, bracket: 'losers' },
  { id: '18', tournamentId: '4', round: 1.1699250014423122, position: 0, player1Id: null, player2Id: null, winnerId: null, matchId: null, playedAt: null, bracket: 'losers' },
  { id: '19', tournamentId: '4', round: 1, position: 0, player1Id: null, player2Id: null, winnerId: null, matchId: null, playedAt: null, bracket: 'grand_final' },
  { id: '50', tournamentId: '8', round: 2, position: 0, player1Id: '8', player2Id: '4', winnerId: '8', matchId: '9', playedAt: '2025-12-13T01:57:32.502Z', bracket: 'winners' },
  { id: '51', tournamentId: '8', round: 2, position: 1, player1Id: '3', player2Id: '7', winnerId: '7', matchId: '10', playedAt: '2025-12-13T01:57:34.838Z', bracket: 'winners' },
  { id: '52', tournamentId: '8', round: 1, position: 0, player1Id: '8', player2Id: '7', winnerId: '8', matchId: '11', playedAt: '2025-12-13T01:57:38.832Z', bracket: 'winners' },
];

function matchWithParticipants(match: Match) {
  const parts = mockParticipants
    .filter(p => p.matchId === match.id)
    .map(p => ({ ...p, playerName: userName(p.playerId) }));
  return { ...match, creatorName: userName(match.createdBy || ''), participants: parts };
}

export const mockFallbacks: Record<string, (...args: any[]) => any> = {
  findAll: () => [...mockUsers].sort((a, b) => b.eloRating - a.eloRating),
  findAllPlayers: (orderBy = 'eloRating') => {
    const p = mockUsers.filter(u => u.username !== 'admin');
    return p.sort((a: any, b: any) => (b[orderBy] || 0) - (a[orderBy] || 0));
  },
  findAllPlayersWithStats: (orderBy = 'eloRating') => {
    const p = mockUsers.filter(u => u.username !== 'admin');
    return p.map(u => {
      const parts = mockParticipants.filter(mp => mp.playerId === u.id);
      return { ...u, totalMatches: parts.length, wins: parts.filter(mp => mp.isWinner).length };
    }).sort((a: any, b: any) => (b[orderBy] || 0) - (a[orderBy] || 0));
  },
  findByUsername: (username: string) => mockUsers.find(u => u.username === username) || null,
  findById: (id: string) => mockUsers.find(u => u.id === id) || null,
  findRecentWithParticipants: (limit = 5) =>
    [...mockMatches].sort((a, b) => b.playedAt.localeCompare(a.playedAt)).slice(0, limit).map(matchWithParticipants),
  findPaginatedWithParticipants: (page = 1, perPage = 5) => {
    const sorted = [...mockMatches].sort((a, b) => b.playedAt.localeCompare(a.playedAt));
    const offset = (page - 1) * perPage;
    return { matches: sorted.slice(offset, offset + perPage).map(matchWithParticipants), total: mockMatches.length };
  },
  countAll: () => mockMatches.length,
  findByMatchId: (matchId: string) => mockParticipants.filter(p => p.matchId === matchId),
  findByPlayerId: (playerId: string) => mockParticipants.filter(p => p.playerId === playerId),
  findActive: () => mockTournaments.filter(t => t.status === 'active'),
  findCompleted: () => mockTournaments.filter(t => t.status === 'completed'),
  findByTournamentId: (tid: string) =>
    mockTournamentMatches.filter(tm => tm.tournamentId === tid)
      .sort((a, b) => a.bracket < b.bracket ? -1 : a.bracket > b.bracket ? 1 : b.round - a.round || a.position - b.position),
  findByRoundAndPosition: (tid: string, round: number, pos: number, bracket = 'winners') =>
    mockTournamentMatches.find(tm => tm.tournamentId === tid && tm.bracket === bracket && tm.round === round && tm.position === pos) || null,
  findByBracket: (tid: string, bracket: string) =>
    mockTournamentMatches.filter(tm => tm.tournamentId === tid && tm.bracket === bracket)
      .sort((a, b) => b.round - a.round || a.position - b.position),
  getPlayerWinsLosses: (pid: string) => {
    const p = mockParticipants.filter(mp => mp.playerId === pid);
    return { wins: p.filter(x => x.isWinner).length, losses: p.filter(x => !x.isWinner).length };
  },
  getAllPlayersStats: () => {
    const m = new Map<string, { wins: number; losses: number }>();
    for (const p of mockParticipants) { const s = m.get(p.playerId) || { wins: 0, losses: 0 }; p.isWinner ? s.wins++ : s.losses++; m.set(p.playerId, s); }
    return m;
  },
  getWeeklyLoserOptimized: () => null,
  getWeeklyPolleraOptimized: () => null,
  getWeeklyGamesCountOptimized: () => new Map<string, number>(),
  getPlayerStreakOptimized: (pid: string) =>
    mockParticipants.filter(p => p.playerId === pid)
      .map(p => ({ matchId: p.matchId, playedAt: mockMatches.find(m => m.id === p.matchId)?.playedAt || '', isWinner: p.isWinner }))
      .sort((a, b) => b.playedAt.localeCompare(a.playedAt)),
  getPlayerFullStatsOptimized: (pid: string) => {
    const p = mockParticipants.filter(mp => mp.playerId === pid);
    return { wins: p.filter(x => x.isWinner).length, losses: p.filter(x => !x.isWinner).length,
      history: p.map(x => ({ playedAt: mockMatches.find(m => m.id === x.matchId)?.playedAt || '', isWinner: x.isWinner })) };
  },
  getNemesisVictimOptimized: (pid: string) => {
    const h2h = new Map<string, { wins: number; losses: number }>();
    for (const m of mockMatches.filter(m2 => m2.matchType === '1v1')) {
      const parts = mockParticipants.filter(p => p.matchId === m.id);
      const me = parts.find(p => p.playerId === pid); const opp = parts.find(p => p.playerId !== pid);
      if (!me || !opp) continue;
      const s = h2h.get(opp.playerId) || { wins: 0, losses: 0 }; me.isWinner ? s.wins++ : s.losses++; h2h.set(opp.playerId, s);
    }
    return Array.from(h2h.entries()).map(([id, s]) => ({ opponentId: id, opponentName: userName(id), ...s }));
  },
  getFirstMatchResult: (pid: string) => { const p = mockParticipants.find(mp => mp.playerId === pid); return p ? p.isWinner : null; },
  getPlayerRecentMatches: (pid: string, limit = 10) =>
    mockParticipants.filter(p => p.playerId === pid)
      .map(p => { const m = mockMatches.find(m2 => m2.id === p.matchId); return { matchId: p.matchId, matchType: m?.matchType || '1v1', playedAt: m?.playedAt || '', civilization: p.civilization, isWinner: p.isWinner, eloChange: p.eloChange }; })
      .sort((a, b) => b.playedAt.localeCompare(a.playedAt)).slice(0, limit),
};
