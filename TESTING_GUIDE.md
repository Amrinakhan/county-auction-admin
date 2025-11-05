# Testing Guide for County Auction Admin

## Step 1: Setup Database in phpMyAdmin

1. Open phpMyAdmin in your browser (usually `http://localhost/phpmyadmin`)
2. Click on the **SQL** tab at the top
3. Copy the entire contents of `database.sql` file
4. Paste it into the SQL editor
5. Click **Go** button
6. You should see success messages for database and tables creation

## Step 2: Add Sample Data (Optional)

1. In phpMyAdmin, go to **SQL** tab again
2. Copy the contents of `database-seed.sql` file
3. Paste and click **Go**
4. You should see "3 rows inserted" messages

## Step 3: Verify Database Connection

1. Make sure your `.env` file has:
   ```
   DATABASE_URL="mysql://root:@localhost:3306/county_admin"
   ```
   (If you have a password, use: `mysql://root:yourpassword@localhost:3306/county_admin`)

## Step 4: Start Your Next.js Server

Open terminal and run:
```bash
npm run dev
```

Wait for: "✓ Ready in X seconds" and "○ Local: http://localhost:3000"

## Step 5: Test API Routes Directly

Open these URLs in your browser to test the APIs:

1. **Test Database Connection:**
   - http://localhost:3000/api/test
   - Should return: `{"status":"ok"}`

2. **Get All Users:**
   - http://localhost:3000/api/users
   - Should return JSON array of users

3. **Get All Properties:**
   - http://localhost:3000/api/properties
   - Should return JSON array of properties

4. **Get All Bids:**
   - http://localhost:3000/api/bids
   - Should return JSON array of bids

## Step 6: Test Frontend Pages

1. **Dashboard Page:**
   - Go to: http://localhost:3000/admin/dashboard
   - Should see 3 stat cards showing:
     - Total Users: 3 (or your count)
     - Total Properties: 3 (or your count)
     - Total Bids: 3 (or your count)

2. **Bidders Page:**
   - Go to: http://localhost:3000/admin/bidders
   - Should see a table with all users listed
   - Columns: ID, Name, Email, Role, Status, Created At

3. **Properties Page:**
   - Go to: http://localhost:3000/admin/properties
   - Should see a table with all properties
   - Columns: ID, Title, County, Status, Created At

## Troubleshooting

### If API returns errors:
- Check MySQL is running
- Verify DATABASE_URL in `.env` is correct
- Check phpMyAdmin that tables exist in `county_admin` database

### If pages show "No data":
- Make sure you ran `database-seed.sql` to add sample data
- Check browser console (F12) for errors
- Verify API routes work first (Step 5)

### If connection fails:
- Make sure MySQL service is running
- Verify database name is `county_admin`
- Check username/password in DATABASE_URL

## Quick Test Commands

```bash
# Test database connection
curl http://localhost:3000/api/test

# Get users
curl http://localhost:3000/api/users

# Get properties  
curl http://localhost:3000/api/properties

# Get bids
curl http://localhost:3000/api/bids
```

