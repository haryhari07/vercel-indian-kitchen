import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export interface User {
  id: string;
  email: string;
  name?: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
}

export interface Rating {
  id: string;
  userId: string;
  recipeSlug: string;
  rating: number;
  timestamp: string;
}

export interface Bookmark {
  userId: string;
  recipeSlug: string;
  timestamp: string;
}

export interface Database {
  users: User[];
  sessions: Session[];
  ratings: Rating[];
  bookmarks: Bookmark[];
}

function getDb(): Database {
  if (!fs.existsSync(DB_PATH)) {
    return { users: [], sessions: [], ratings: [], bookmarks: [] };
  }
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  try {
    const db = JSON.parse(data);
    // Migration: ensure new fields exist
    if (!db.ratings) db.ratings = [];
    if (!db.bookmarks) db.bookmarks = [];
    return db;
  } catch (error) {
    return { users: [], sessions: [], ratings: [], bookmarks: [] };
  }
}

function saveDb(db: Database) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export const db = {
  findUserByEmail: (email: string) => {
    const data = getDb();
    return data.users.find((u) => u.email === email);
  },

  findUserById: (id: string) => {
    const data = getDb();
    return data.users.find((u) => u.id === id);
  },

  createUser: (email: string, password: string, name?: string, role: 'user' | 'admin' = 'user') => {
    const data = getDb();
    if (data.users.find((u) => u.email === email)) {
      throw new Error('User already exists');
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      passwordHash: crypto.createHash('sha256').update(password).digest('hex'),
      role,
      createdAt: new Date().toISOString(),
    };
    data.users.push(newUser);
    saveDb(data);
    return newUser;
  },

  validatePassword: (user: User, password: string) => {
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    return user.passwordHash === hash;
  },

  createSession: (userId: string) => {
    const data = getDb();
    // Remove expired sessions
    data.sessions = data.sessions.filter(s => new Date(s.expiresAt) > new Date());
    
    const session: Session = {
      id: crypto.randomUUID(),
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };
    data.sessions.push(session);
    saveDb(data);
    return session;
  },

  getSession: (sessionId: string) => {
    const data = getDb();
    const session = data.sessions.find((s) => s.id === sessionId);
    if (!session) return null;
    if (new Date(session.expiresAt) < new Date()) {
      // Clean up if expired
      const newData = getDb();
      newData.sessions = newData.sessions.filter((s) => s.id !== sessionId);
      saveDb(newData);
      return null;
    }
    return session;
  },

  deleteSession: (sessionId: string) => {
    const data = getDb();
    data.sessions = data.sessions.filter((s) => s.id !== sessionId);
    saveDb(data);
  },
  
  getAllUsers: () => {
    const data = getDb();
    // Return users without passwordHash
    return data.users.map(({ passwordHash, ...user }) => user);
  },

  // Ratings
  upsertRating: (userId: string, recipeSlug: string, ratingValue: number) => {
    const data = getDb();
    const existingIndex = data.ratings.findIndex(
      (r) => r.userId === userId && r.recipeSlug === recipeSlug
    );

    if (existingIndex > -1) {
      data.ratings[existingIndex].rating = ratingValue;
      data.ratings[existingIndex].timestamp = new Date().toISOString();
    } else {
      data.ratings.push({
        id: crypto.randomUUID(),
        userId,
        recipeSlug,
        rating: ratingValue,
        timestamp: new Date().toISOString(),
      });
    }
    saveDb(data);
  },

  getRating: (userId: string, recipeSlug: string) => {
    const data = getDb();
    return data.ratings.find((r) => r.userId === userId && r.recipeSlug === recipeSlug);
  },
  
  getRecipeAverageRating: (recipeSlug: string) => {
    const data = getDb();
    const recipeRatings = data.ratings.filter((r) => r.recipeSlug === recipeSlug);
    if (recipeRatings.length === 0) return null;
    
    const sum = recipeRatings.reduce((acc, curr) => acc + curr.rating, 0);
    return {
      average: parseFloat((sum / recipeRatings.length).toFixed(1)),
      count: recipeRatings.length
    };
  },

  // Bookmarks
  toggleBookmark: (userId: string, recipeSlug: string) => {
    const data = getDb();
    const existingIndex = data.bookmarks.findIndex(
      (b) => b.userId === userId && b.recipeSlug === recipeSlug
    );

    let isBookmarked = false;
    if (existingIndex > -1) {
      data.bookmarks.splice(existingIndex, 1); // Remove
      isBookmarked = false;
    } else {
      data.bookmarks.push({
        userId,
        recipeSlug,
        timestamp: new Date().toISOString(),
      });
      isBookmarked = true;
    }
    saveDb(data);
    return isBookmarked;
  },

  isBookmarked: (userId: string, recipeSlug: string) => {
    const data = getDb();
    return data.bookmarks.some((b) => b.userId === userId && b.recipeSlug === recipeSlug);
  },

  getUserBookmarks: (userId: string) => {
    const data = getDb();
    return data.bookmarks
      .filter((b) => b.userId === userId)
      .map((b) => b.recipeSlug);
  }
};

// Initialize Admin if not exists
// We wrap this in a try-catch because this might run during build where fs write might be restricted or behave differently
try {
  const adminEmail = 'admin@indiankitchen.com';
  if (!db.findUserByEmail(adminEmail)) {
    // console.log('Creating default admin user...'); 
    // We avoid console.log to keep output clean, but we create the admin
    db.createUser(adminEmail, 'admin123', 'Admin User', 'admin');
  }
} catch (e) {
  // Ignore init errors
}
