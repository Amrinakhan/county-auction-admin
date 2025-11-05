# 🚂 Complete Railway Database Setup Guide

This guide will help you set up your MySQL database on Railway and migrate your local data.

---

## Step 1: Export Your Local Database

### In phpMyAdmin:

1. **Select your database**:
   - Click on `county_admin` in the left sidebar

2. **Export**:
   - Click the **"Export"** tab at the top
   - **Method**: Select **"Quick"**
   - **Format**: Make sure **"SQL"** is selected
   - Click **"Go"** button

3. **Save the file**:
   - A file will download: `county_admin.sql`
   - Save it somewhere safe (Desktop or Downloads folder)
   - **Remember where you saved it!**

✅ **Done!** You now have a backup of your database.

---

## Step 2: Sign Up for Railway

1. **Go to Railway**: https://railway.app

2. **Sign Up**:
   - Click **"Start a New Project"** or **"Login"**
   - Choose **"Login with GitHub"** (easiest option)
   - Authorize Railway to access your GitHub account

3. **You're in!** Railway dashboard will open

---

## Step 3: Create a New Project

1. **Click "New Project"** button (top right)

2. **Select "Deploy from GitHub repo"** OR **"Empty Project"**
   - For now, choose **"Empty Project"** (we just need the database)

3. **Name your project** (optional):
   - Example: "County Auction DB"
   - Or leave default name

---

## Step 4: Add MySQL Database

1. **In your Railway project**, click **"+ New"** button

2. **Select "Database"** from the dropdown

3. **Choose "Add MySQL"**

4. **Wait for Railway to provision**:
   - Railway will create a MySQL database for you
   - This takes about 30-60 seconds
   - You'll see a progress indicator

5. **Database is ready!** ✅

---

## Step 5: Get Your Connection String

1. **Click on your MySQL service** in Railway dashboard

2. **Go to "Variables" tab**:
   - You'll see all environment variables
   - Look for `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLHOST`, `MYSQLPORT`

3. **Copy the `DATABASE_URL`**:
   - Railway automatically creates this
   - It looks like: `mysql://root:password@containers-us-west-xxx.railway.app:5432/railway`
   - **Copy this entire string** - you'll need it for Vercel!

4. **Alternative**: If `DATABASE_URL` is not shown, construct it manually:
   ```
   mysql://[MYSQLUSER]:[MYSQLPASSWORD]@[MYSQLHOST]:[MYSQLPORT]/[MYSQLDATABASE]
   ```
   Replace the brackets with actual values from Variables tab.

✅ **Save this connection string!** You'll use it in Vercel.

---

## Step 6: Import Your Local Database

### Option A: Using Railway's MySQL Console (Recommended)

1. **In Railway MySQL service**, click **"Query"** tab

2. **Open your exported SQL file**:
   - Open `county_admin.sql` in a text editor (Notepad, VS Code, etc.)
   - Copy ALL the contents (Ctrl+A, Ctrl+C)

3. **Paste into Railway Query**:
   - Paste the SQL into the query box
   - Click **"Run"** or press Ctrl+Enter

4. **Wait for import to complete**:
   - You'll see success messages
   - All your tables and data will be imported!

### Option B: Using MySQL Command Line

If you have MySQL client installed:

```bash
mysql -h [MYSQLHOST] -P [MYSQLPORT] -u [MYSQLUSER] -p[MYSQLPASSWORD] [MYSQLDATABASE] < county_admin.sql
```

Replace brackets with values from Railway Variables.

---

## Step 7: Verify Your Data

1. **In Railway**, go to MySQL service → **"Query"** tab

2. **Run a test query**:
   ```sql
   SHOW TABLES;
   ```

3. **Check if your tables exist**:
   - You should see: `users`, `properties`, `counties`, `bids`, `auctions`, etc.

4. **Verify data**:
   ```sql
   SELECT COUNT(*) FROM users;
   ```
   - Should show the number of users you had locally

✅ **If data is there, you're ready for Vercel!**

---

## Step 8: Security & Access

### Make Database Publicly Accessible:

Railway databases are accessible by default, but verify:

1. **In Railway MySQL service** → **"Settings"** tab
2. **Check "Public Networking"** - should be enabled
3. **Note the Public URL** if different from internal URL

---

## 🎯 What You Have Now

✅ Cloud MySQL database on Railway  
✅ All your data imported  
✅ Connection string ready for Vercel  
✅ Database accessible from anywhere  

---

## 📝 Next Steps

Now that you have Railway database set up:

1. ✅ **Copy your `DATABASE_URL`** from Railway Variables
2. ✅ **Generate secrets** (NEXTAUTH_SECRET, JWT_SECRET)
3. ✅ **Deploy to Vercel** with these environment variables

---

## ❓ Troubleshooting

**Problem**: Can't see DATABASE_URL in Variables
- **Solution**: Check all tabs, or construct manually using the format above

**Problem**: Import fails
- **Solution**: Make sure SQL file is valid. Try importing table by table.

**Problem**: Can't connect to database
- **Solution**: Check Public Networking is enabled in Settings

---

**Ready? Let me know when you've completed these steps and I'll help you deploy to Vercel!** 🚀

