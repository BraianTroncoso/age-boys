import { createClient } from '@libsql/client';

const client = createClient({
  url: "libsql://age-boys-braiantroncoso.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjUzMTY3NDEsImlkIjoiYzQxZDJjM2EtZWI3OC00ZDhkLWIwNzEtZjZiYTI4MjY2NTQwIiwicmlkIjoiODkxNTk3YWItNjdmMS00NDkxLTk1ZjItODEwYmU3OWNkMTFlIn0.NrirvlVTesOfJjoOKB3eMHYI8VA16K6UaFN3-K5ppS-Ius2-mHdZfymcSPtNvAKfCuYPoO_4amaRk6dCPmbkCw"
});
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
let initialized = false;
async function ensureInit() {
  if (!initialized) {
    await initTables();
    initialized = true;
  }
}
const db = {
  users: {
    findAll: async () => {
      await ensureInit();
      const result = await client.execute("SELECT * FROM users ORDER BY eloRating DESC");
      return result.rows;
    },
    findByUsername: async (username) => {
      await ensureInit();
      const result = await client.execute({
        sql: "SELECT * FROM users WHERE username = ?",
        args: [username]
      });
      return result.rows[0];
    },
    findById: async (id) => {
      await ensureInit();
      const result = await client.execute({
        sql: "SELECT * FROM users WHERE id = ?",
        args: [id]
      });
      return result.rows[0];
    },
    create: async (user) => {
      await ensureInit();
      const result = await client.execute({
        sql: "INSERT INTO users (username, passwordHash, favoriteCiv) VALUES (?, ?, ?) RETURNING *",
        args: [user.username, user.passwordHash, user.favoriteCiv]
      });
      return result.rows[0];
    },
    update: async (id, updates) => {
      await ensureInit();
      const fields = [];
      const values = [];
      if (updates.favoriteCiv !== void 0) {
        fields.push("favoriteCiv = ?");
        values.push(updates.favoriteCiv);
      }
      if (updates.eloRating !== void 0) {
        fields.push("eloRating = ?");
        values.push(updates.eloRating);
      }
      if (updates.eloTeams !== void 0) {
        fields.push("eloTeams = ?");
        values.push(updates.eloTeams);
      }
      if (updates.eloFfa !== void 0) {
        fields.push("eloFfa = ?");
        values.push(updates.eloFfa);
      }
      if (updates.isAdmin !== void 0) {
        fields.push("isAdmin = ?");
        values.push(updates.isAdmin);
      }
      if (fields.length > 0) {
        values.push(id);
        await client.execute({
          sql: `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
          args: values
        });
      }
    }
  },
  // Alias for compatibility
  players: {
    findAll: async () => {
      return db.users.findAll();
    },
    findById: async (id) => {
      return db.users.findById(id);
    },
    findByName: async (name) => {
      return db.users.findByUsername(name);
    },
    update: async (id, updates) => {
      return db.users.update(id, updates);
    }
  },
  matches: {
    findAll: async () => {
      await ensureInit();
      const result = await client.execute("SELECT * FROM matches ORDER BY playedAt DESC");
      return result.rows;
    },
    findById: async (id) => {
      await ensureInit();
      const result = await client.execute({
        sql: "SELECT * FROM matches WHERE id = ?",
        args: [id]
      });
      return result.rows[0];
    },
    create: async (match) => {
      await ensureInit();
      const result = await client.execute({
        sql: "INSERT INTO matches (matchType, createdBy) VALUES (?, ?) RETURNING *",
        args: [match.matchType, match.createdBy || null]
      });
      return result.rows[0];
    }
  },
  participants: {
    findByMatchId: async (matchId) => {
      await ensureInit();
      const result = await client.execute({
        sql: "SELECT * FROM match_participants WHERE matchId = ?",
        args: [matchId]
      });
      return result.rows.map((row) => ({
        ...row,
        isWinner: Boolean(row.isWinner)
      }));
    },
    findByPlayerId: async (playerId) => {
      await ensureInit();
      const result = await client.execute({
        sql: "SELECT * FROM match_participants WHERE playerId = ?",
        args: [playerId]
      });
      return result.rows.map((row) => ({
        ...row,
        isWinner: Boolean(row.isWinner)
      }));
    },
    create: async (participant) => {
      await ensureInit();
      const result = await client.execute({
        sql: "INSERT INTO match_participants (matchId, playerId, team, civilization, isWinner, eloChange) VALUES (?, ?, ?, ?, ?, ?) RETURNING *",
        args: [
          participant.matchId,
          participant.playerId,
          participant.team,
          participant.civilization,
          participant.isWinner ? 1 : 0,
          participant.eloChange
        ]
      });
      const row = result.rows[0];
      return {
        ...row,
        isWinner: Boolean(row.isWinner)
      };
    }
  }
};

export { db as d };
