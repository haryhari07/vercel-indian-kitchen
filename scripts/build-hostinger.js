const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = path.join(__dirname, '..');
const deployDir = path.join(sourceDir, 'hostinger-deploy');

console.log('🚀 Starting Hostinger Build Process...');

// 1. Clean previous deploy folder
if (fs.existsSync(deployDir)) {
  console.log('🧹 Cleaning previous build...');
  fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir);

// 2. Run Next.js Build
console.log('🏗️  Running Next.js Build...');
try {
  // Set environment variable to ensure standalone output
  process.env.NEXT_PRIVATE_STANDALONE = 'true';
  execSync('npm run build', { stdio: 'inherit', cwd: sourceDir });
} catch (error) {
  console.error('❌ Build failed!');
  process.exit(1);
}

// 3. Copy Standalone Server
console.log('📦 Copying standalone server...');
const standaloneDir = path.join(sourceDir, '.next', 'standalone');
if (!fs.existsSync(standaloneDir)) {
  console.error('❌ Standalone build not found! Ensure output: "standalone" is in next.config.ts');
  process.exit(1);
}
// Copy everything from standalone to deployDir
fs.cpSync(standaloneDir, deployDir, { recursive: true });

// 4. Copy Static Assets (.next/static -> .next/static)
console.log('🎨 Copying static assets...');
const staticSource = path.join(sourceDir, '.next', 'static');
const staticDest = path.join(deployDir, '.next', 'static');
fs.mkdirSync(path.dirname(staticDest), { recursive: true });
fs.cpSync(staticSource, staticDest, { recursive: true });

// 5. Copy Public Folder
console.log('📂 Copying public folder...');
const publicSource = path.join(sourceDir, 'public');
const publicDest = path.join(deployDir, 'public');
fs.cpSync(publicSource, publicDest, { recursive: true });

// 6. Copy Data Folder (Database)
console.log('💾 Copying database folder...');
const dataSource = path.join(sourceDir, 'data');
const dataDest = path.join(deployDir, 'data');
if (fs.existsSync(dataSource)) {
    fs.cpSync(dataSource, dataDest, { recursive: true });
} else {
    fs.mkdirSync(dataDest);
    fs.writeFileSync(path.join(dataDest, 'db.json'), JSON.stringify({
        users: [],
        sessions: [],
        ratings: [],
        bookmarks: [],
        activities: [],
        comments: [],
        recipes: []
    }));
}

// 7. Create an ecosystem.config.js for PM2 (often used in Node.js hosting)
console.log('📝 Creating PM2 config...');
const pm2Config = `
module.exports = {
  apps: [
    {
      name: 'indian-kitchen',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
`;
fs.writeFileSync(path.join(deployDir, 'ecosystem.config.js'), pm2Config);

// 8. Create a simple .env template
console.log('📝 Creating .env template...');
const envTemplate = `
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=${require('crypto').randomBytes(32).toString('hex')}
GOOGLE_API_KEY=your-google-api-key-here
`;
fs.writeFileSync(path.join(deployDir, '.env.example'), envTemplate);

console.log(`
✅ Hostinger Deployment Package Ready!
-------------------------------------
📂 Location: ${deployDir}

👉 NEXT STEPS FOR YOU:
1. Go to the 'hostinger-deploy' folder.
2. Select ALL files inside and ZIP them (e.g., 'deploy.zip').
3. Upload 'deploy.zip' to Hostinger File Manager in 'public_html'.
4. Extract the ZIP.
5. In Hostinger Node.js Dashboard:
   - Set 'Application Startup File' to 'server.js'.
   - Set 'Node.js Version' to 20 or higher.
   - Run 'NPM Install'.
   - Add your Environment Variables (from .env.example).
   - Start the application.

⚠️ IMPORTANT: Your database is in 'data/db.json'. 
If you redeploy later, do NOT overwrite this file on the server or you will lose your data!
`);
