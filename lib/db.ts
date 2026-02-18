import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MongoClient, Db, Collection } from 'mongodb';
import { recipes as initialRecipes } from '@/data/recipes';
import { cache } from 'react';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'indian_kitchen';

// Interfaces
export interface Recipe {
  id: string;
  title: string;
  slug: string;
  state: string;
  region: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  description: string;
  ingredients: { item: string; quantity: string }[];
  instructions: string[];
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  dietary: string[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  passwordHash: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
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

export interface Activity {
  id: string;
  userId: string;
  type: 'bookmark' | 'rating' | 'login' | 'signup' | 'comment';
  targetSlug?: string;
  details: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  userId: string;
  recipeSlug: string;
  content: string;
  timestamp: string;
}

export interface Database {
  users: User[];
  sessions: Session[];
  ratings: Rating[];
  bookmarks: Bookmark[];
  activities: Activity[];
  comments: Comment[];
  recipes: Recipe[];
}

// MongoDB Client Connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGODB_URI) {
    console.error('CRITICAL: MONGODB_URI is missing from environment variables!');
    throw new Error('MONGODB_URI is not defined');
  }

  console.log('Attempting to connect to MongoDB with URI:', MONGODB_URI.split('@')[1] || 'invalid-uri');

  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
      family: 4
    });
    
    console.log('Successfully connected to MongoDB Atlas');
    const db = client.db(MONGODB_DB);

    cachedClient = client;
    cachedDb = db;

    // Ensure indexes for performance
    try {
      await db.collection('recipes').createIndex({ slug: 1 }, { unique: true });
      await db.collection('recipes').createIndex({ state: 1 });
      await db.collection('recipes').createIndex({ region: 1 });
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('bookmarks').createIndex({ userId: 1, recipeSlug: 1 });
      await db.collection('comments').createIndex({ recipeSlug: 1, timestamp: -1 });
    } catch (indexError) {
      console.warn('Could not create indexes:', indexError);
    }

    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Local File DB Helpers
let cachedFileDb: Database | null = null;

function getFileDb(): Database {
  if (cachedFileDb) return cachedFileDb;

  if (!fs.existsSync(DB_PATH)) {
    const initialDb: Database = {
      users: [],
      sessions: [],
      ratings: [],
      bookmarks: [],
      activities: [],
      comments: [],
      recipes: initialRecipes,
    };
    try {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2));
    } catch (e) {
      // Ignore write errors
    }
    cachedFileDb = initialDb;
    return initialDb;
  }
  
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(data);
    // Migration: ensure new fields exist
    if (!db.ratings) db.ratings = [];
    if (!db.bookmarks) db.bookmarks = [];
    if (!db.activities) db.activities = [];
    if (!db.comments) db.comments = [];
    if (!db.recipes) db.recipes = initialRecipes;
    
    cachedFileDb = db;
    return db;
  } catch (error) {
    return { 
      users: [], 
      sessions: [], 
      ratings: [], 
      bookmarks: [], 
      activities: [], 
      comments: [],
      recipes: initialRecipes 
    };
  }
}

function saveFileDb(db: Database) {
  cachedFileDb = db;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (e) {
    // Ignore write errors in serverless
  }
}

// Password helpers
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash.includes(':')) {
    const legacyHash = crypto.createHash('sha256').update(password).digest('hex');
    return legacyHash === storedHash;
  }
  const [salt, hash] = storedHash.split(':');
  const verifyHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return hash === verifyHash;
}

// Unified DB Object with Async Methods
export const db = {
  // Activities
  logActivity: async (userId: string, type: Activity['type'], details: string, targetSlug?: string) => {
    const activity: Activity = {
      id: crypto.randomUUID(),
      userId,
      type,
      details,
      targetSlug,
      timestamp: new Date().toISOString(),
    };

    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      await db.collection('activities').insertOne(activity);
    } else {
      const data = getFileDb();
      data.activities.push(activity);
      saveFileDb(data);
    }
  },

  // Users
  findUserByEmail: cache(async (email: string) => {
    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      return await db.collection<User>('users').findOne({ email });
    } else {
      const data = getFileDb();
      return data.users.find((u) => u.email === email);
    }
  }),

  findUserById: cache(async (id: string) => {
    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      return await db.collection<User>('users').findOne({ id });
    } else {
      const data = getFileDb();
      return data.users.find((u) => u.id === id);
    }
  }),

  createUser: async (email: string, password: string, name?: string, role: 'user' | 'admin' = 'user') => {
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      passwordHash: hashPassword(password),
      role,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      const existing = await db.collection('users').findOne({ email });
      if (existing) throw new Error('User already exists');
      
      await db.collection('users').insertOne(newUser);
      await db.collection('activities').insertOne({
        id: crypto.randomUUID(),
        userId: newUser.id,
        type: 'signup',
        details: 'User registered',
        timestamp: new Date().toISOString(),
      });
    } else {
      const data = getFileDb();
      if (data.users.find((u) => u.email === email)) throw new Error('User already exists');
      data.users.push(newUser);
      data.activities.push({
        id: crypto.randomUUID(),
        userId: newUser.id,
        type: 'signup',
        details: 'User registered',
        timestamp: new Date().toISOString(),
      });
      saveFileDb(data);
    }
    return newUser;
  },

  validatePassword: (user: User, password: string) => {
    return verifyPassword(password, user.passwordHash);
  },

  // Sessions
  createSession: async (userId: string) => {
    const session: Session = {
      id: crypto.randomUUID(),
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      // Cleanup expired sessions occasionally (or let MongoDB TTL handle it)
      await db.collection('sessions').deleteMany({ expiresAt: { $lt: new Date().toISOString() } });
      await db.collection('sessions').insertOne(session);
      await db.collection('activities').insertOne({
        id: crypto.randomUUID(),
        userId,
        type: 'login',
        details: 'User logged in',
        timestamp: new Date().toISOString(),
      });
    } else {
      const data = getFileDb();
      data.sessions = data.sessions.filter(s => new Date(s.expiresAt) > new Date());
      data.sessions.push(session);
      data.activities.push({
        id: crypto.randomUUID(),
        userId,
        type: 'login',
        details: 'User logged in',
        timestamp: new Date().toISOString(),
      });
      saveFileDb(data);
    }
    return session;
  },

  getSession: cache(async (sessionId: string) => {
    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      const session = await db.collection<Session>('sessions').findOne({ id: sessionId });
      if (session && new Date(session.expiresAt) < new Date()) {
        await db.collection('sessions').deleteOne({ id: sessionId });
        return null;
      }
      return session;
    } else {
      const data = getFileDb();
      const session = data.sessions.find((s) => s.id === sessionId);
      if (!session) return null;
      if (new Date(session.expiresAt) < new Date()) {
        data.sessions = data.sessions.filter((s) => s.id !== sessionId);
        saveFileDb(data);
        return null;
      }
      return session;
    }
  }),

  deleteSession: async (sessionId: string) => {
    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      const session = await db.collection<Session>('sessions').findOne({ id: sessionId });
      if (session) {
        await db.collection('activities').insertOne({
          id: crypto.randomUUID(),
          userId: session.userId,
          type: 'login',
          details: 'User logged out',
          timestamp: new Date().toISOString(),
        });
        await db.collection('sessions').deleteOne({ id: sessionId });
      }
    } else {
      const data = getFileDb();
      const session = data.sessions.find((s) => s.id === sessionId);
      if (session) {
        data.activities.push({
          id: crypto.randomUUID(),
          userId: session.userId,
          type: 'login',
          details: 'User logged out',
          timestamp: new Date().toISOString(),
        });
        data.sessions = data.sessions.filter((s) => s.id !== sessionId);
        saveFileDb(data);
      }
    }
  },

  // Admin
  getAllUsers: cache(async () => {
    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      const users = await db.collection<User>('users').find().toArray();
      return users.map(({ passwordHash, ...user }) => ({ ...user, status: user.status || 'active' }));
    } else {
      const data = getFileDb();
      return data.users.map(({ passwordHash, ...user }) => ({ ...user, status: user.status || 'active' }));
    }
  }),

  updateUserStatus: async (userId: string, status: 'active' | 'blocked') => {
    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      const res = await db.collection('users').updateOne({ id: userId }, { $set: { status } });
      return res.modifiedCount > 0;
    } else {
      const data = getFileDb();
      const user = data.users.find((u) => u.id === userId);
      if (user) {
        user.status = status;
        saveFileDb(data);
        return true;
      }
      return false;
    }
  },

  deleteUser: async (userId: string) => {
    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      const res = await db.collection('users').deleteOne({ id: userId });
      if (res.deletedCount > 0) {
        await db.collection('sessions').deleteMany({ userId });
        await db.collection('ratings').deleteMany({ userId });
        await db.collection('bookmarks').deleteMany({ userId });
        await db.collection('activities').deleteMany({ userId });
        await db.collection('comments').deleteMany({ userId });
        return true;
      }
      return false;
    } else {
      const data = getFileDb();
      const initialLength = data.users.length;
      data.users = data.users.filter(u => u.id !== userId);
      if (data.users.length !== initialLength) {
        data.sessions = data.sessions.filter(s => s.userId !== userId);
        data.ratings = data.ratings.filter(r => r.userId !== userId);
        data.bookmarks = data.bookmarks.filter(b => b.userId !== userId);
        data.activities = data.activities.filter(a => a.userId !== userId);
        if (data.comments) data.comments = data.comments.filter(c => c.userId !== userId);
        saveFileDb(data);
        return true;
      }
      return false;
    }
  },

  // Ratings
  upsertRating: async (userId: string, recipeSlug: string, ratingValue: number) => {
    const rating: Rating = {
      id: crypto.randomUUID(),
      userId,
      recipeSlug,
      rating: ratingValue,
      timestamp: new Date().toISOString(),
    };

    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      await db.collection('ratings').updateOne(
        { userId, recipeSlug },
        { $set: { rating: ratingValue, timestamp: rating.timestamp, id: rating.id } },
        { upsert: true }
      );
      await db.collection('activities').insertOne({
        id: crypto.randomUUID(),
        userId,
        type: 'rating',
        targetSlug: recipeSlug,
        details: `Rated recipe ${recipeSlug} with ${ratingValue} stars`,
        timestamp: new Date().toISOString(),
      });
    } else {
      const data = getFileDb();
      const idx = data.ratings.findIndex(r => r.userId === userId && r.recipeSlug === recipeSlug);
      if (idx > -1) {
        data.ratings[idx].rating = ratingValue;
        data.ratings[idx].timestamp = rating.timestamp;
      } else {
        data.ratings.push(rating);
      }
      data.activities.push({
        id: crypto.randomUUID(),
        userId,
        type: 'rating',
        targetSlug: recipeSlug,
        details: `Rated recipe ${recipeSlug} with ${ratingValue} stars`,
        timestamp: new Date().toISOString(),
      });
      saveFileDb(data);
    }
  },

  getRating: cache(async (userId: string, recipeSlug: string) => {
    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      return await db.collection<Rating>('ratings').findOne({ userId, recipeSlug });
    } else {
      const data = getFileDb();
      return data.ratings.find((r) => r.userId === userId && r.recipeSlug === recipeSlug);
    }
  }),

  getRecipeAverageRating: cache(async (recipeSlug: string) => {
    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      const ratings = await db.collection<Rating>('ratings').find({ recipeSlug }).toArray();
      if (ratings.length === 0) return null;
      const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
      return { average: parseFloat((sum / ratings.length).toFixed(1)), count: ratings.length };
    } else {
      const data = getFileDb();
      const recipeRatings = data.ratings.filter((r) => r.recipeSlug === recipeSlug);
      if (recipeRatings.length === 0) return null;
      const sum = recipeRatings.reduce((acc, curr) => acc + curr.rating, 0);
      return { average: parseFloat((sum / recipeRatings.length).toFixed(1)), count: recipeRatings.length };
    }
  }),

  // Bookmarks
  toggleBookmark: async (userId: string, recipeSlug: string) => {
    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      const existing = await db.collection<Bookmark>('bookmarks').findOne({ userId, recipeSlug });
      let isBookmarked = false;
      if (existing) {
        await db.collection('bookmarks').deleteOne({ userId, recipeSlug });
        isBookmarked = false;
      } else {
        await db.collection('bookmarks').insertOne({ userId, recipeSlug, timestamp: new Date().toISOString() });
        isBookmarked = true;
      }
      await db.collection('activities').insertOne({
        id: crypto.randomUUID(),
        userId,
        type: 'bookmark',
        targetSlug: recipeSlug,
        details: isBookmarked ? `Bookmarked recipe ${recipeSlug}` : `Removed bookmark from recipe ${recipeSlug}`,
        timestamp: new Date().toISOString(),
      });
      return isBookmarked;
    } else {
      const data = getFileDb();
      const idx = data.bookmarks.findIndex(b => b.userId === userId && b.recipeSlug === recipeSlug);
      let isBookmarked = false;
      if (idx > -1) {
        data.bookmarks.splice(idx, 1);
        isBookmarked = false;
      } else {
        data.bookmarks.push({ userId, recipeSlug, timestamp: new Date().toISOString() });
        isBookmarked = true;
      }
      data.activities.push({
        id: crypto.randomUUID(),
        userId,
        type: 'bookmark',
        targetSlug: recipeSlug,
        details: isBookmarked ? `Bookmarked recipe ${recipeSlug}` : `Removed bookmark from recipe ${recipeSlug}`,
        timestamp: new Date().toISOString(),
      });
      saveFileDb(data);
      return isBookmarked;
    }
  },

  isBookmarked: cache(async (userId: string, recipeSlug: string) => {
    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      const count = await db.collection('bookmarks').countDocuments({ userId, recipeSlug });
      return count > 0;
    } else {
      const data = getFileDb();
      return data.bookmarks.some((b) => b.userId === userId && b.recipeSlug === recipeSlug);
    }
  }),

  getUserBookmarks: cache(async (userId: string) => {
    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      const bookmarks = await db.collection<Bookmark>('bookmarks').find({ userId }).toArray();
      return bookmarks.map(b => b.recipeSlug);
    } else {
      const data = getFileDb();
      return data.bookmarks.filter((b) => b.userId === userId).map((b) => b.recipeSlug);
    }
  }),

  // Comments
  getAllComments: cache(async () => {
    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      const comments = await db.collection<Comment>('comments').find().sort({ timestamp: -1 }).toArray();
      const users = await db.collection<User>('users').find().toArray();
      return comments.map(c => {
        const user = users.find(u => u.id === c.userId);
        return { ...c, user: user ? { name: user.name, email: user.email } : { name: 'Anonymous', email: 'Unknown' } };
      });
    } else {
      const data = getFileDb();
      return (data.comments || []).map(c => {
        const user = data.users.find(u => u.id === c.userId);
        return { ...c, user: user ? { name: user.name, email: user.email } : { name: 'Anonymous', email: 'Unknown' } };
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  }),

  deleteComment: async (commentId: string) => {
    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      const res = await db.collection('comments').deleteOne({ id: commentId });
      return res.deletedCount > 0;
    } else {
      const data = getFileDb();
      if (!data.comments) return false;
      const initialLength = data.comments.length;
      data.comments = data.comments.filter(c => c.id !== commentId);
      if (data.comments.length !== initialLength) {
        saveFileDb(data);
        return true;
      }
      return false;
    }
  },

  getComments: cache(async (recipeSlug: string) => {
    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      const comments = await db.collection<Comment>('comments').find({ recipeSlug }).sort({ timestamp: -1 }).toArray();
      const users = await db.collection<User>('users').find().toArray();
      return comments.map(c => {
        const user = users.find(u => u.id === c.userId);
        return { ...c, user: user ? { name: user.name } : { name: 'Anonymous' } };
      });
    } else {
      const data = getFileDb();
      return (data.comments || []).filter(c => c.recipeSlug === recipeSlug).map(c => {
        const user = data.users.find(u => u.id === c.userId);
        return { ...c, user: user ? { name: user.name } : { name: 'Anonymous' } };
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  }),

  addComment: async (userId: string, recipeSlug: string, content: string) => {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      userId,
      recipeSlug,
      content,
      timestamp: new Date().toISOString(),
    };

    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      await db.collection('comments').insertOne(newComment);
      await db.collection('activities').insertOne({
        id: crypto.randomUUID(),
        userId,
        type: 'comment',
        targetSlug: recipeSlug,
        details: `Commented on recipe ${recipeSlug}`,
        timestamp: new Date().toISOString(),
      });
      const user = await db.collection<User>('users').findOne({ id: userId });
      return { ...newComment, user: user ? { name: user.name } : { name: 'Anonymous' } };
    } else {
      const data = getFileDb();
      if (!data.comments) data.comments = [];
      data.comments.push(newComment);
      data.activities.push({
        id: crypto.randomUUID(),
        userId,
        type: 'comment',
        targetSlug: recipeSlug,
        details: `Commented on recipe ${recipeSlug}`,
        timestamp: new Date().toISOString(),
      });
      saveFileDb(data);
      const user = data.users.find(u => u.id === userId);
      return { ...newComment, user: user ? { name: user.name } : { name: 'Anonymous' } };
    }
  },

  // Recipes
  getRecipes: cache(async () => {
    try {
      if (MONGODB_URI) {
        const { db } = await connectToDatabase();
        const recipes = await db.collection<Recipe>('recipes').find().toArray();
        return Array.isArray(recipes) ? recipes : [];
      } else {
        const data = getFileDb();
        return Array.isArray(data.recipes) ? data.recipes : [];
      }
    } catch (error) {
      console.error('Error in getRecipes:', error);
      return [];
    }
  }),

  getLatestRecipes: cache(async (limit: number = 4) => {
    try {
      if (MONGODB_URI) {
        const { db } = await connectToDatabase();
        const recipes = await db.collection<Recipe>('recipes').find().sort({ _id: -1 }).limit(limit).toArray();
        return Array.isArray(recipes) ? recipes : [];
      } else {
        const data = getFileDb();
        const recipes = Array.isArray(data.recipes) ? data.recipes : [];
        return [...recipes].reverse().slice(0, limit);
      }
    } catch (error) {
      console.error('Error in getLatestRecipes:', error);
      return [];
    }
  }),

  getRecipe: cache(async (slug: string) => {
    try {
      if (MONGODB_URI) {
        const { db } = await connectToDatabase();
        return await db.collection<Recipe>('recipes').findOne({ slug });
      } else {
        const data = getFileDb();
        return (data.recipes || []).find(r => r.slug === slug);
      }
    } catch (error) {
      console.error('Error in getRecipe:', error);
      return null;
    }
  }),

  createRecipe: async (recipeData: Omit<Recipe, 'id' | 'rating' | 'reviewCount'>) => {
    const newRecipe: Recipe = {
      ...recipeData,
      id: crypto.randomUUID(),
      rating: 0,
      reviewCount: 0,
    };

    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      const existing = await db.collection('recipes').findOne({ slug: recipeData.slug });
      if (existing) throw new Error('Recipe with this slug already exists');
      await db.collection('recipes').insertOne(newRecipe);
    } else {
      const data = getFileDb();
      if (!data.recipes) data.recipes = [];
      if (data.recipes.find(r => r.slug === recipeData.slug)) throw new Error('Recipe with this slug already exists');
      data.recipes.push(newRecipe);
      saveFileDb(data);
    }
    return newRecipe;
  },

  updateRecipe: async (slug: string, updates: Partial<Recipe>) => {
    const { id, ...safeUpdates } = updates;
    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      const res = await db.collection('recipes').findOneAndUpdate(
        { slug },
        { $set: safeUpdates },
        { returnDocument: 'after' }
      );
      return res as unknown as Recipe;
    } else {
      const data = getFileDb();
      const idx = data.recipes.findIndex(r => r.slug === slug);
      if (idx === -1) return null;
      data.recipes[idx] = { ...data.recipes[idx], ...safeUpdates };
      saveFileDb(data);
      return data.recipes[idx];
    }
  },

  deleteRecipe: async (slug: string) => {
    if (MONGODB_URI) {
      const { db } = await connectToDatabase();
      const res = await db.collection('recipes').deleteOne({ slug });
      return res.deletedCount > 0;
    } else {
      const data = getFileDb();
      const initialLength = data.recipes.length;
      data.recipes = data.recipes.filter(r => r.slug !== slug);
      if (data.recipes.length !== initialLength) {
        saveFileDb(data);
        return true;
      }
      return false;
    }
  }
};

// Initial admin creation
if (typeof window === 'undefined') {
  (async () => {
    try {
      const adminEmail = 'admin@indiankitchen.com';
      const existing = await db.findUserByEmail(adminEmail);
      if (!existing) {
        await db.createUser(adminEmail, 'admin123', 'Admin User', 'admin');
      }
    } catch (e) {
      // Ignore init errors
    }
  })();
}
