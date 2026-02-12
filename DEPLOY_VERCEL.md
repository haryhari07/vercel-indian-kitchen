# Deploying to Vercel (with MongoDB)

To deploy this project to Vercel, you need to use a cloud database like MongoDB because Vercel's filesystem is read-only.

## 1. Set up MongoDB Atlas (Free Tier)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (Shared/Free).
3. In **Database Access**, create a user with a username and password.
4. In **Network Access**, add `0.0.0.0/0` (Allow access from anywhere) so Vercel can connect.
5. Go to **Clusters** -> **Connect** -> **Connect your application**.
6. Copy the connection string (it looks like `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority`).

## 2. Prepare Environment Variables

You will need the following environment variables for Vercel:

- `MONGODB_URI`: Your MongoDB connection string (replace `<password>` with your actual password).
- `MONGODB_DB`: `indian_kitchen` (or your preferred database name).
- `NEXTAUTH_SECRET`: A random string for authentication security (you can generate one with `openssl rand -base64 32`).
- `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., `https://your-app-name.vercel.app`).
- `GOOGLE_CLIENT_ID`: (Optional) For Google Login.
- `GOOGLE_CLIENT_SECRET`: (Optional) For Google Login.
- `GEMINI_API_KEY`: (Optional) For AI features.

## 3. Deploy to Vercel

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and click **New Project**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, add all the variables mentioned above.
5. Click **Deploy**.

## 4. Migrate Existing Data (Optional)

If you have data in your local `data/db.json` that you want to move to MongoDB:

1. In your local terminal, set your `MONGODB_URI` temporarily:
   ```bash
   # Windows (PowerShell)
   $env:MONGODB_URI="your_mongodb_connection_string"
   npm run migrate:mongo

   # Mac/Linux
   MONGODB_URI="your_mongodb_connection_string" npm run migrate:mongo
   ```
2. This script will upload all users, recipes, comments, etc., from your local file to your MongoDB cloud database.

## 5. Troubleshooting Login

If login is not working on Vercel:
1. Check Vercel logs for any errors related to `MONGODB_URI`.
2. Ensure you have added `0.0.0.0/0` to MongoDB Network Access.
3. Ensure `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set correctly.
