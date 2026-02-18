
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Basic env parser
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
        const index = trimmedLine.indexOf('=');
        if (index > -1) {
            const key = trimmedLine.substring(0, index).trim();
            const value = trimmedLine.substring(index + 1).trim();
            env[key] = value;
        }
    }
});

async function test() {
    const uri = env.MONGODB_URI;
    console.log('Testing connection to:', uri ? uri.split('@')[1] : 'UNDEFINED');
    
    if (!uri) {
        console.error('Error: MONGODB_URI not found in .env');
        return;
    }

    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
    });

    try {
        await client.connect();
        console.log('✅ Connection SUCCESSFUL!');
        const db = client.db(process.env.MONGODB_DB || 'test');
        const collections = await db.listCollections().toArray();
        console.log('Collections found:', collections.length);
    } catch (err) {
        console.error('❌ Connection FAILED:');
        console.error(err.message);
        if (err.message.includes('querySrv ETIMEOUT') || err.message.includes('ECONNREFUSED')) {
            console.log('\n--- DIAGNOSIS ---');
            console.log('1. Check if your IP is whitelisted in MongoDB Atlas (Network Access -> 0.0.0.0/0).');
            console.log('2. Try using the "Standard Connection String" (mongodb:// instead of mongodb+srv://).');
            console.log('3. Check if your firewall/antivirus is blocking port 27017.');
        }
    } finally {
        await client.close();
    }
}

test();
