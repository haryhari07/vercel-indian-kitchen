# How to Deploy to Hostinger (with Database & Login)

You asked if it's possible to use a **Static Export** (`out` folder) while keeping the database and login working.

**Answer: No.** 
Static exports turn your website into simple HTML files. They cannot run the server-side code required for:
1.  **Login/Sign Up** (NextAuth needs a server).
2.  **Database** (Reading/Writing to `db.json` needs a server).
3.  **AI Features** (API keys must be hidden on a server).

**Solution: Deploy as a Node.js Application**
Hostinger supports Node.js applications on most plans. I have configured your project to use Next.js `standalone` mode, which is optimized for production.

---

## 🛠️ Step-by-Step Deployment Guide

### 1. Run the Automated Build Script
Instead of manual copying, I created a script that prepares everything for you. Run this in your terminal:
```bash
npm run build:hostinger
```
This will create a new folder called `hostinger-deploy`.

### 2. Prepare the Upload
1.  Open the `hostinger-deploy` folder.
2.  Select **all files and folders** inside it.
3.  Right-click and **Compress to ZIP** (name it `deploy.zip`).

### 3. Upload to Hostinger
1.  Log in to your **Hostinger hPanel**.
2.  Go to **Websites** -> **Manage** -> **File Manager**.
3.  Navigate to `public_html`.
4.  **Upload** your `deploy.zip` file and **Extract** it directly into `public_html`.
    *   *Make sure `server.js` is in the root of `public_html`, not inside a subfolder.*

### 4. Configure Node.js in Hostinger
1.  In hPanel, search for **Node.js** in the sidebar.
2.  **Node.js Configuration**:
    *   **Node.js Version**: Select **v20** (or higher).
    *   **Application Startup File**: `server.js` (CRITICAL: Change it from app.js to server.js).
    *   **Application Root**: `public_html`.
3.  Click **Save** or **Create**.

### 5. Install Dependencies & Start
1.  In the same Node.js section, click **NPM Install**.
2.  Add your **Environment Variables**:
    *   `NEXTAUTH_URL`: `https://your-domain.com`
    *   `NEXTAUTH_SECRET`: (Check `.env.example` in your deploy folder for a generated one)
    *   `GOOGLE_API_KEY`: (Your Gemini API key)
3.  Click **Restart** or **Start**.

---

## ⚠️ Important: Managing your Database
Your data is stored in `data/db.json`. 
*   **Don't Overwrite**: When you update your site in the future, **DO NOT** upload the `data` folder again if you want to keep your users and comments.
*   **Backup**: Regularly download `data/db.json` from Hostinger's File Manager to your computer.

## 🚀 Alternative: Truly Static Deployment
If you *really* want a static site (HTML only), we would need to:
1.  Move the database to **Supabase** or **MongoDB Atlas** (External cloud DB).
2.  Change Auth to a client-side provider like **Clerk** or **Firebase**.
3.  Use `output: 'export'` in `next.config.ts`.
