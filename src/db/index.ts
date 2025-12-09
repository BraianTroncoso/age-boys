import * as fs from 'fs';
import * as path from 'path';

// Simple JSON-based database that works everywhere
const DB_PATH = './data/aoe3.json';

// Usuario = Jugador (fusionados)
interface User {
  id: number;
  username: string;
  passwordHash: string;
  favoriteCiv: string;     // Civilización favorita
  eloRating: number;       // ELO 1v1
  eloTeams: number;        // ELO equipos
  eloFfa: number;          // ELO FFA
  createdAt: Date;
}

interface Match {
  id: number;
  matchType: string;
  playedAt: Date;
  createdBy?: number;
  createdAt: Date;
}

interface MatchParticipant {
  id: number;
  matchId: number;
  playerId: number;    // Referencia a User.id (usuario = jugador)
  team: number | null;
  civilization: string;
  isWinner: boolean;
  eloChange: number;
}

interface Database {
  users: User[];
  matches: Match[];
  matchParticipants: MatchParticipant[];
  _counters: {
    users: number;
    matches: number;
    matchParticipants: number;
  };
}

function ensureDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadDb(): Database {
  ensureDir();
  if (!fs.existsSync(DB_PATH)) {
    const initial: Database = {
      users: [],
      matches: [],
      matchParticipants: [],
      _counters: { users: 0, matches: 0, matchParticipants: 0 }
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  // Migración: si existe players pero no tiene los nuevos campos en users, migrar
  if (data.players && !data._counters.hasOwnProperty('players') === false) {
    // Mantener compatibilidad con DB antigua
    if (!data._counters.matchParticipants) {
      data._counters.matchParticipants = data._counters.players || 0;
    }
  }
  return data;
}

function saveDb(data: Database) {
  ensureDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Database operations
export const db = {
  // Users (Usuario = Jugador)
  users: {
    findAll: (): User[] => {
      const data = loadDb();
      return [...data.users].sort((a, b) => b.eloRating - a.eloRating);
    },
    findByUsername: (username: string): User | undefined => {
      const data = loadDb();
      return data.users.find(u => u.username === username);
    },
    findById: (id: number): User | undefined => {
      const data = loadDb();
      return data.users.find(u => u.id === id);
    },
    create: (user: Omit<User, 'id' | 'createdAt' | 'eloRating' | 'eloTeams' | 'eloFfa'>): User => {
      const data = loadDb();
      const newUser: User = {
        ...user,
        id: ++data._counters.users,
        eloRating: 1000,
        eloTeams: 1000,
        eloFfa: 1000,
        createdAt: new Date()
      };
      data.users.push(newUser);
      saveDb(data);
      return newUser;
    },
    update: (id: number, updates: Partial<User>) => {
      const data = loadDb();
      const index = data.users.findIndex(u => u.id === id);
      if (index !== -1) {
        data.users[index] = { ...data.users[index], ...updates };
        saveDb(data);
      }
    }
  },

  // Alias: players apunta a users para compatibilidad
  players: {
    findAll: (): User[] => {
      const data = loadDb();
      return [...data.users].sort((a, b) => b.eloRating - a.eloRating);
    },
    findById: (id: number): User | undefined => {
      const data = loadDb();
      return data.users.find(u => u.id === id);
    },
    findByName: (name: string): User | undefined => {
      const data = loadDb();
      return data.users.find(u => u.username === name);
    },
    update: (id: number, updates: Partial<User>) => {
      const data = loadDb();
      const index = data.users.findIndex(u => u.id === id);
      if (index !== -1) {
        data.users[index] = { ...data.users[index], ...updates };
        saveDb(data);
      }
    }
  },

  // Matches
  matches: {
    findAll: (): Match[] => {
      const data = loadDb();
      return [...data.matches].sort((a, b) =>
        new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
      );
    },
    findById: (id: number): Match | undefined => {
      const data = loadDb();
      return data.matches.find(m => m.id === id);
    },
    create: (match: Omit<Match, 'id' | 'createdAt' | 'playedAt'>): Match => {
      const data = loadDb();
      const newMatch: Match = {
        ...match,
        id: ++data._counters.matches,
        playedAt: new Date(),
        createdAt: new Date()
      };
      data.matches.push(newMatch);
      saveDb(data);
      return newMatch;
    }
  },

  // Match Participants
  participants: {
    findByMatchId: (matchId: number): MatchParticipant[] => {
      const data = loadDb();
      return data.matchParticipants.filter(p => p.matchId === matchId);
    },
    findByPlayerId: (playerId: number): MatchParticipant[] => {
      const data = loadDb();
      return data.matchParticipants.filter(p => p.playerId === playerId);
    },
    create: (participant: Omit<MatchParticipant, 'id'>): MatchParticipant => {
      const data = loadDb();
      const newParticipant: MatchParticipant = {
        ...participant,
        id: ++data._counters.matchParticipants
      };
      data.matchParticipants.push(newParticipant);
      saveDb(data);
      return newParticipant;
    }
  }
};

// Type exports
export type { User, Match, MatchParticipant };
// Alias Player = User para compatibilidad
export type Player = User;
