# Deployment Guide - County Auction Admin Panel

This guide covers deploying the County Auction Admin Panel to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- MySQL database (local or cloud provider like PlanetScale, AWS RDS, etc.)
- Node.js 18+ installed locally (for testing)

## Step 1: Prepare Your Code

### 1.1 Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: County Auction Admin Panel"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/county-auction-admin.git
git branch -M main
git push -u origin main
```

### 1.2 Verify Build Locally

```bash
# Install dependencies
npm install

# Run Prisma generate
npx prisma generate

# Test production build
npm run build

# If build succeeds, you're ready to deploy!
```

## Step 2: Deploy to Vercel

### 2.1 Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select the repository from the list

### 2.2 Configure Project Settings

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `./` (default)

**Build Command:** `npm run build` (default)

**Output Directory:** `.next` (default)

**Install Command:** `npm install` (default)

### 2.3 Set Environment Variables

In Vercel project settings → **Environment Variables**, add:

#### Required Variables

```
DATABASE_URL=mysql://user:password@host:port/database
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
JWT_SECRET=your-jwt-secret-key-here
```

#### Optional Variables (for development/testing)

```
MOCK_USER_ID=1
MOCK_USER_EMAIL=admin@countyauction.com
MOCK_USER_ROLE=SuperAdmin
MOCK_USER_COUNTY_ID=
```

#### AWS S3 (for file uploads - optional)

```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

#### Email (for notifications - optional)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@countyauction.com
```

**Important:** Set these for **Production**, **Preview**, and **Development** environments as needed.

### 2.4 Deploy

Click **"Deploy"** and wait for the build to complete.

## Step 3: Database Setup

### 3.1 Run Prisma Migrations

After deployment, you need to run Prisma migrations in production:

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Run migrations in production
vercel env pull .env.production
npx prisma migrate deploy
```

#### Option B: Using Vercel Build Command

Add to `package.json`:

```json
{
  "scripts": {
    "postbuild": "prisma migrate deploy"
  }
}
```

**Note:** This runs migrations on every build. Use with caution.

#### Option C: Manual SQL Execution

1. Connect to your production database
2. Run the SQL migrations from `prisma/migrations/` folder
3. Or use `prisma db push` (not recommended for production)

### 3.2 Generate Prisma Client

Ensure Prisma client is generated in the build:

Add to `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

## Step 4: Verify Deployment

1. Visit your Vercel deployment URL
2. Test admin panel login (if auth is implemented)
3. Test CRUD operations (Counties, Properties, Bidders, Bids)
4. Check error logs in Vercel Dashboard → **Logs**

## Step 5: Custom Domain (Optional)

1. Go to Vercel project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` environment variable to your custom domain

## Troubleshooting

### Build Fails

- Check Vercel build logs for errors
- Ensure all environment variables are set
- Verify `DATABASE_URL` is accessible from Vercel's servers
- Check that `prisma generate` runs successfully

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check if your database allows connections from Vercel IPs
- For cloud databases, whitelist Vercel IP ranges

### Prisma Client Not Found

- Ensure `prisma generate` runs in build process
- Add `postinstall` script to `package.json`:
  ```json
  "postinstall": "prisma generate"
  ```

### Environment Variables Not Loading

- Ensure variables are set for the correct environment (Production/Preview/Development)
- Redeploy after adding new variables

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Database migrations run successfully
- [ ] Prisma client generated
- [ ] Build completes without errors
- [ ] Admin panel accessible at Vercel URL
- [ ] CRUD operations working
- [ ] Error logging configured (optional)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)

## Security Notes

- **Never commit `.env` files** to Git
- Use strong secrets for `NEXTAUTH_SECRET` and `JWT_SECRET`
- Restrict database access to Vercel IPs only
- Use environment-specific variables
- Enable Vercel's automatic security features

## Support

For issues specific to:
- **Vercel:** Check [Vercel Documentation](https://vercel.com/docs)
- **Prisma:** Check [Prisma Documentation](https://www.prisma.io/docs)
- **Next.js:** Check [Next.js Documentation](https://nextjs.org/docs)

---

**Last Updated:** 2025-01-XX

