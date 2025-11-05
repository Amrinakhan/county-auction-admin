# 🔐 Environment Variables Setup Guide

## What You Need to Provide

To deploy your County Auction Admin Panel to Vercel, you need to provide the following information:

---

## ✅ Required Information

### 1. Database Connection String

**What is it?**
Your MySQL database connection string.

**Format:**
```
mysql://username:password@host:port/database_name
```

**Where to get it:**

#### If using PlanetScale:
1. Go to https://planetscale.com
2. Sign up/Login
3. Create a new database
4. Go to "Connect" → Copy the connection string
5. It will look like: `mysql://xxxxx:xxxxx@xxxxx.psdb.cloud/database_name?sslaccept=strict`

#### If using Railway:
1. Go to https://railway.app
2. Sign up/Login
3. Create new project → Add MySQL service
4. Go to "Variables" → Copy `DATABASE_URL`
5. It will look like: `mysql://root:password@containers-us-west-xxx.railway.app:port/railway`

#### If using your local MySQL:
```
mysql://root:your_password@localhost:3306/county_admin
```
⚠️ **Note**: Local databases won't work with Vercel. You need a cloud database.

**Action Required:** 
- [ ] Choose a database provider (PlanetScale or Railway recommended)
- [ ] Create database
- [ ] Copy connection string

---

### 2. Generate Secret Keys

You need to generate **2 random secret keys**:

#### NEXTAUTH_SECRET
Used for NextAuth.js session encryption.

**How to generate:**
- Option 1: Use online generator: https://generate-secret.vercel.app/32
- Option 2: Run in terminal: `openssl rand -base64 32`
- Option 3: Use any random string generator (32+ characters)

**Example:** `aB3xK9mP2qR7vT5wY8zA1cD4eF6gH0iJ1kL2mN3oP4q`

#### JWT_SECRET
Used for JWT token signing.

**How to generate:**
- Same as above (generate a DIFFERENT value)
- Use: https://generate-secret.vercel.app/32
- Or: `openssl rand -base64 32`

**Example:** `X9yZ8wV7uT6sR5qP4oN3mL2kJ1iH0gF6eD5cB4a`

**Action Required:**
- [ ] Generate NEXTAUTH_SECRET
- [ ] Generate JWT_SECRET
- [ ] Save both values safely

---

### 3. Deployment URL (Auto-generated)

**What is it?**
Your Vercel app URL (you'll get this after first deployment).

**Format:**
```
https://your-app-name.vercel.app
```

**Action Required:**
- [ ] After first deployment, Vercel will give you this URL
- [ ] Then update `NEXTAUTH_URL` environment variable with this URL

---

## 📝 Complete Environment Variables List

Once you have all the information above, here's what to add in Vercel:

### Required Variables (MUST HAVE):

```
DATABASE_URL=mysql://username:password@host:port/database_name
NEXTAUTH_SECRET=your-generated-secret-here
JWT_SECRET=your-generated-secret-here
NEXTAUTH_URL=https://your-app-name.vercel.app
```

### Optional Variables (Can add later):

```
MOCK_USER_ID=1
MOCK_USER_EMAIL=admin@countyauction.com
MOCK_USER_ROLE=SuperAdmin
MOCK_USER_COUNTY_ID=
```

---

## 🎯 Quick Action Plan

1. **Choose Database Provider** (PlanetScale or Railway)
   - [ ] Sign up
   - [ ] Create database
   - [ ] Copy connection string

2. **Generate Secrets**
   - [ ] Generate NEXTAUTH_SECRET
   - [ ] Generate JWT_SECRET

3. **Deploy to Vercel**
   - [ ] Import project from GitHub
   - [ ] Add environment variables
   - [ ] Deploy

4. **After Deployment**
   - [ ] Get your Vercel URL
   - [ ] Update NEXTAUTH_URL
   - [ ] Run database migrations

---

## ❓ Need Help?

**Question**: "I don't have a database yet"
- **Answer**: Use PlanetScale (free) or Railway (easy setup)

**Question**: "How do I generate secrets?"
- **Answer**: Use https://generate-secret.vercel.app/32 (generate twice for different values)

**Question**: "Can I use my local MySQL?"
- **Answer**: No, Vercel can't access localhost. Use a cloud database.

**Question**: "What if I don't have these values right now?"
- **Answer**: You can start deployment and add environment variables later, but the app won't work until DATABASE_URL is set.

---

## 🚀 Ready to Deploy?

Once you have:
- ✅ Database connection string
- ✅ NEXTAUTH_SECRET
- ✅ JWT_SECRET

You're ready to proceed with Vercel deployment!

