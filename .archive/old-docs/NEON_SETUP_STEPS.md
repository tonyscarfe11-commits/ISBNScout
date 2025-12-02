# Neon PostgreSQL Setup - Manual Steps

Since `neonctl init` requires interactive mode, follow these simple steps:

## Step 1: Create Neon Account (2 minutes)

1. Go to https://neon.tech/
2. Click **"Sign Up"** (top right)
3. Choose sign-up method:
   - GitHub (fastest - 1 click)
   - Google
   - Email

## Step 2: Create Database Project (3 minutes)

1. After login, click **"Create a project"**
2. Fill in details:
   - **Project name:** `isbnscout-prod`
   - **Database name:** `neondb` (default is fine)
   - **Region:** Choose closest to your users:
     - 🇺🇸 `US East (Ohio)` - For US users
     - 🇪🇺 `Europe (Frankfurt)` - For UK/EU users
     - 🇸🇬 `Asia Pacific (Singapore)` - For Asia users
   - **PostgreSQL version:** 16 (default)
   - **Compute size:** Starter (default - free tier)

3. Click **"Create project"**

## Step 3: Get Connection String (1 minute)

After project creation, you'll see the connection details page:

1. Find the **"Connection string"** section
2. Make sure the toggle shows **"Pooled connection"** (recommended)
3. Click **"Copy"** button

The connection string looks like:
```
postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

4. **IMPORTANT:** Save this somewhere secure! You'll need it in the next step.

## Step 4: Update .env File

Open `.env` file and replace the DATABASE_URL:

```bash
# OLD (fake URL):
DATABASE_URL=postgresql://user:password@localhost:5432/isbnscout

# NEW (your real Neon URL):
DATABASE_URL=postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

Save the file.

## Step 5: Push Database Schema to Neon

Run this command to create all tables:

```bash
npm run db:push
```

**Expected output:**
```
✓ Pulling schema from database...
✓ Pushing schema to database...
✓ Changes applied:
  - Created table "users"
  - Created table "api_credentials"
  - Created table "books"
  - Created table "listings"
  - Created table "inventory_items"
```

## Step 6: Verify Database Setup

1. Go back to Neon console (https://console.neon.tech/)
2. Click on your project: **isbnscout-prod**
3. Click **"Tables"** in left sidebar
4. You should see 5 tables:
   - ✅ users
   - ✅ api_credentials
   - ✅ books
   - ✅ listings
   - ✅ inventory_items

## Step 7: Test Database Connection

Restart your dev server to pick up the new DATABASE_URL:

```bash
npm run dev:clean
```

**Look for this in the logs:**
```
[Storage] Using PostgreSQL (Neon)
```

If you see that, you're connected to Neon! 🎉

## Troubleshooting

**Error: "connect ECONNREFUSED"**
- Check DATABASE_URL is copied correctly (no extra spaces)
- Verify Neon project is active (not paused)

**Error: "SSL error"**
- Make sure `?sslmode=require` is at the end of the connection string

**Error: "authentication failed"**
- Double-check the username and password in the connection string
- Generate a new password in Neon console if needed

## Neon Free Tier Limits

✅ **Included in Free Tier:**
- 0.5 GB storage
- 1 project
- Unlimited queries
- Automatic backups (7 days)
- Branching for development
- Serverless driver (fast cold starts)

📊 **When to Upgrade:**
- > 0.5 GB storage needed → Pro ($19/month)
- Need more projects → Pro ($19/month)
- Need longer backups → Pro ($19/month)

For ISBNScout, free tier is plenty to start! Upgrade when you hit 500-1,000 active users.

---

## Quick Copy-Paste Checklist

```bash
# 1. After getting DATABASE_URL from Neon, update .env:
# DATABASE_URL=postgresql://...your-neon-url...

# 2. Push schema to Neon:
npm run db:push

# 3. Restart dev server:
npm run dev:clean

# 4. Look for confirmation:
# [Storage] Using PostgreSQL (Neon)

# 5. Test database by creating a user:
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"TestPass123!"}'

# 6. Check Neon console - you should see the new user in the "users" table!
```

---

**Next:** After Neon is set up, you can deploy to Railway/Fly.io using the same DATABASE_URL! 🚀
