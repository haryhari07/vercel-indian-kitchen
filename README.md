# Indian Kitchen

Indian Kitchen is a modern Next.js application for exploring authentic Indian recipes. It features AI-powered recipe generation, user authentication, and a responsive design optimized for performance.

## 1. System Prerequisites
Before running the project, ensure you have the following installed:
- **Node.js**: Version 18.17.0 or higher (Required for Next.js 14+)
- **npm**: Version 9.0.0 or higher (or yarn/pnpm/bun)
- **Operating System**: Windows, macOS, or Linux

## 2. Environment Variables
Create a `.env` file in the root directory with the following keys. These are required for full functionality (Authentication and AI features).

```env
# Google Authentication (NextAuth.js)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth Configuration
# Run `openssl rand -base64 32` to generate a secret
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Google Gemini AI (Recipe Genie)
# Get API key from: https://aistudio.google.com/
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
# Fallback key name if above is not set
GOOGLE_API_KEY=your_backup_api_key_here
```

## 3. Tech Stack & Key Dependencies
The project uses the following core technologies:

### Core Framework
- **Next.js 16.1**: App Router, Server Actions, API Routes
- **React 19**: Server Components, Hooks
- **TypeScript**: Static typing

### Styling & UI
- **Tailwind CSS v4**: Utility-first CSS
- **Framer Motion**: Animations (Lazy loaded for performance)
- **Lucide React**: Icons

### Backend & Data
- **NextAuth.js**: Authentication (Google Provider)
- **LowDB / JSON DB**: Local file-based database (`data/db.json`)
- **Google Generative AI**: Gemini Flash model for Recipe Genie

### Image Optimization
- **Sharp**: High-performance image processing
- **next/image**: AVIF/WebP formats, lazy loading

## 4. Installation & Running
1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

3.  **Build for Production**:
    ```bash
    npm run build
    npm start
    ```

## 5. Project Structure & Features
- **`app/`**: Next.js App Router pages and API endpoints.
    - `genie/`: AI Recipe Generator.
    - `admin/`: Admin dashboard (protected).
    - `(auth)`: Signin/Signup pages.
- **`data/`**: Static data (`recipes.ts`) and database file (`db.json`).
- **`lib/`**: Helper functions (`db.ts`, `auth.ts`).
- **`components/`**: Reusable UI components.
- **`public/`**: Static assets (images, icons).

## 6. Security Features
- **CSP (Content Security Policy)**: Implemented in `middleware.ts`.
- **Secure Headers**: HSTS, X-Frame-Options, X-Content-Type-Options.
- **Password Hashing**: Scrypt (salted) for admin users.
- **Role-Based Access**: Admin middleware protection.

## 7. Utility Scripts
Located in `scripts/`:
- `add_ratings.js`: Seeding rating data.
- `download_images.mjs`: Fetching placeholders.
- `update_recipes.mjs`: Batch updating recipe data.
