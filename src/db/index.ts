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
    findAllPlayers: async (): Promise<User[]> => {
      await ensureInit();
      // Excluir admin del ranking
      const result = await client.execute("SELECT * FROM users WHERE username != 'admin' ORDER BY eloRating DESC");
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
  }
};

// Type exports
export type { User, Match, MatchParticipant };
export type Player = User;
