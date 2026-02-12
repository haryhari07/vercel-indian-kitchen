const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'indian_kitchen';

async function migrate() {
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }

  if (!fs.existsSync(DB_PATH)) {
    console.error(`Error: Local database file not found at ${DB_PATH}`);
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    console.log('Connected successfully to MongoDB');

    const localData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    const collections = [
      'users',
      'sessions',
      'ratings',
      'bookmarks',
      'activities',
      'comments',
      'recipes'
    ];

    for (const collectionName of collections) {
      const data = localData[collectionName];
      if (data && Array.isArray(data) && data.length > 0) {
        console.log(`Migrating ${data.length} items to collection: ${collectionName}...`);
        
        // Clear existing data in collection (optional, but safer for a clean migration)
        await db.collection(collectionName).deleteMany({});
        
        // Insert data
        await db.collection(collectionName).insertMany(data);
        console.log(`Successfully migrated ${collectionName}`);
      } else {
        console.log(`No data found for collection: ${collectionName}, skipping.`);
      }
    }

    console.log('\nMigration completed successfully!');
    console.log('You can now use MongoDB for your database.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

migrate();
