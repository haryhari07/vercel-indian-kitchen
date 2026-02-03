import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

import { recipes as initialRecipes } from '@/data/recipes';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

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

function getDb(): Database {
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
    return initialDb;
  }
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  try {
    const db = JSON.parse(data);
    // Migration: ensure new fields exist
    if (!db.ratings) db.ratings = [];
    if (!db.bookmarks) db.bookmarks = [];
    if (!db.activities) db.activities = [];
    if (!db.comments) db.comments = [];
    if (!db.recipes) {
      db.recipes = initialRecipes;
      try {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
      } catch (e) {
        // Ignore write errors
      }
    }
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

function saveDb(db: Database) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export const db = {
  logActivity: (userId: string, type: 'bookmark' | 'rating' | 'login' | 'signup' | 'comment', details: string, targetSlug?: string) => {
    const data = getDb();
    if (!data.activities) data.activities = []; // Double check
    
    data.activities.push({
      id: crypto.randomUUID(),
      userId,
      type,
      details,
      targetSlug,
      timestamp: new Date().toISOString(),
    });
    saveDb(data);
  },

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
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    data.users.push(newUser);
    
    // Log signup activity
    if (!data.activities) data.activities = [];
    data.activities.push({
      id: crypto.randomUUID(),
      userId: newUser.id,
      type: 'signup',
      details: 'User registered',
      timestamp: new Date().toISOString(),
    });
    
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

    // Log login
    if (!data.activities) data.activities = [];
    data.activities.push({
      id: crypto.randomUUID(),
      userId,
      type: 'login',
      details: 'User logged in',
      timestamp: new Date().toISOString(),
    });

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
    const session = data.sessions.find((s) => s.id === sessionId);
    
    if (session) {
      // Log logout
      if (!data.activities) data.activities = [];
      data.activities.push({
        id: crypto.randomUUID(),
        userId: session.userId,
        type: 'login', // keeping type simple, or could add 'logout'
        details: 'User logged out',
        timestamp: new Date().toISOString(),
      });
    }

    data.sessions = data.sessions.filter((s) => s.id !== sessionId);
    saveDb(data);
  },
  
  getAllUsers: () => {
    const data = getDb();
    // Return users without passwordHash
    return data.users.map(({ passwordHash, ...user }) => ({
      ...user,
      status: user.status || 'active' // Backwards compatibility
    }));
  },

  updateUserStatus: (userId: string, status: 'active' | 'blocked') => {
    const data = getDb();
    const user = data.users.find((u) => u.id === userId);
    if (user) {
      user.status = status;
      saveDb(data);
      return true;
    }
    return false;
  },

  deleteUser: (userId: string) => {
    const data = getDb();
    const initialLength = data.users.length;
    data.users = data.users.filter(u => u.id !== userId);
    
    if (data.users.length !== initialLength) {
      // Also cleanup related data
      data.sessions = data.sessions.filter(s => s.userId !== userId);
      data.ratings = data.ratings.filter(r => r.userId !== userId);
      data.bookmarks = data.bookmarks.filter(b => b.userId !== userId);
      data.activities = data.activities.filter(a => a.userId !== userId);
      if (data.comments) {
        data.comments = data.comments.filter(c => c.userId !== userId);
      }
      
      saveDb(data);
      return true;
    }
    return false;
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
    
    // Log rating
    if (!data.activities) data.activities = [];
    data.activities.push({
      id: crypto.randomUUID(),
      userId,
      type: 'rating',
      targetSlug: recipeSlug,
      details: `Rated recipe ${recipeSlug} with ${ratingValue} stars`,
      timestamp: new Date().toISOString(),
    });

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
    
    // Log bookmark
    if (!data.activities) data.activities = [];
    data.activities.push({
      id: crypto.randomUUID(),
      userId,
      type: 'bookmark',
      targetSlug: recipeSlug,
      details: isBookmarked ? `Bookmarked recipe ${recipeSlug}` : `Removed bookmark from recipe ${recipeSlug}`,
      timestamp: new Date().toISOString(),
    });

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
  },

  // Comments
  getAllComments: () => {
    const data = getDb();
    return data.comments
      .map((c) => {
        const user = data.users.find((u) => u.id === c.userId);
        return {
          ...c,
          user: user ? { name: user.name, email: user.email } : { name: 'Anonymous', email: 'Unknown' }
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  deleteComment: (commentId: string) => {
    const data = getDb();
    if (!data.comments) return false;
    
    const initialLength = data.comments.length;
    data.comments = data.comments.filter(c => c.id !== commentId);
    
    if (data.comments.length !== initialLength) {
      saveDb(data);
      return true;
    }
    return false;
  },

  getComments: (recipeSlug: string) => {
    const data = getDb();
    // Return comments with user details
    return data.comments
      .filter((c) => c.recipeSlug === recipeSlug)
      .map((c) => {
        const user = data.users.find((u) => u.id === c.userId);
        return {
          ...c,
          user: user ? { name: user.name } : { name: 'Anonymous' }
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  addComment: (userId: string, recipeSlug: string, content: string) => {
    const data = getDb();
    const newComment: Comment = {
      id: crypto.randomUUID(),
      userId,
      recipeSlug,
      content,
      timestamp: new Date().toISOString(),
    };
    
    if (!data.comments) data.comments = [];
    data.comments.push(newComment);
    
    // Log activity
    if (!data.activities) data.activities = [];
    data.activities.push({
      id: crypto.randomUUID(),
      userId,
      type: 'comment',
      targetSlug: recipeSlug,
      details: `Commented on recipe ${recipeSlug}`,
      timestamp: new Date().toISOString(),
    });

    saveDb(data);
    
    // Return with user info
    const user = data.users.find((u) => u.id === userId);
    return {
      ...newComment,
      user: user ? { name: user.name } : { name: 'Anonymous' }
    };
  },

  // Recipe Management
  getRecipes: () => {
    const data = getDb();
    return data.recipes || [];
  },

  getRecipe: (slug: string) => {
    const data = getDb();
    return (data.recipes || []).find(r => r.slug === slug);
  },

  createRecipe: (recipeData: Omit<Recipe, 'id' | 'rating' | 'reviewCount'>) => {
    const data = getDb();
    if (!data.recipes) data.recipes = [];
    
    // Check if slug exists
    if (data.recipes.find(r => r.slug === recipeData.slug)) {
      throw new Error('Recipe with this slug already exists');
    }

    const newRecipe: Recipe = {
      ...recipeData,
      id: crypto.randomUUID(),
      rating: 0,
      reviewCount: 0,
    };

    data.recipes.push(newRecipe);
    saveDb(data);
    return newRecipe;
  },

  updateRecipe: (slug: string, updates: Partial<Recipe>) => {
    const data = getDb();
    if (!data.recipes) return null;

    const index = data.recipes.findIndex(r => r.slug === slug);
    if (index === -1) return null;

    // Prevent ID change
    const { id, ...safeUpdates } = updates;
    
    data.recipes[index] = { ...data.recipes[index], ...safeUpdates };
    saveDb(data);
    return data.recipes[index];
  },

  deleteRecipe: (slug: string) => {
    const data = getDb();
    if (!data.recipes) return false;

    const initialLength = data.recipes.length;
    data.recipes = data.recipes.filter(r => r.slug !== slug);
    
    if (data.recipes.length !== initialLength) {
      saveDb(data);
      return true;
    }
    return false;
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
