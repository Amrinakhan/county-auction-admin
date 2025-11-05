# 🔧 Fix Audit Logs - Step by Step

## Problem
Audit logs are not being saved to the database when creating bidders or other entities.

## Solution Steps

### Step 1: Create/Fix the Database Table ⚠️ **DO THIS FIRST**

1. Open **phpMyAdmin**
2. Select the `county_admin` database
3. Go to the **SQL** tab
4. Copy and paste this SQL:

```sql
USE county_admin;

-- Drop and recreate the table with correct structure
DROP TABLE IF EXISTS audit_log;

CREATE TABLE audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(255) NOT NULL,
  entity VARCHAR(255) NOT NULL,
  entity_id INT NULL,
  performed_by VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  details TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at),
  INDEX idx_entity (entity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

5. Click **Go** to execute
6. You should see: "Table 'audit_log' has been created"

### Step 2: Regenerate Prisma Client

**IMPORTANT:** Stop your dev server first (Ctrl+C), then run:

```bash
npx prisma generate
```

You should see: "Generated Prisma Client"

### Step 3: Restart Dev Server

```bash
npm run dev
```

### Step 4: Test the Table

1. Open your browser
2. Go to: `http://localhost:3000/api/test-audit`
3. You should see a JSON response with:
   - `success: true`
   - Test records created
   - Recent logs listed

If you see errors, check:
- Is the table created? (run `SHOW TABLES LIKE 'audit_log'` in phpMyAdmin)
- Are the column names correct? (run `DESCRIBE audit_log` in phpMyAdmin)

### Step 5: Test Creating a Bidder

1. Go to `/admin/bidders`
2. Click "Add Bidder"
3. Fill in the form and submit
4. **Check your terminal/console** - you should see:
   - `🔵 Attempting to log audit for bidder: [id]`
   - `✅ Audit log created successfully: [id]`

### Step 6: Verify in Database

Run this in phpMyAdmin:

```sql
SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 10;
```

You should see the new audit log entries!

### Step 7: Check Activity Page

Go to `/admin/activity` - you should see the audit logs displayed in the table.

## 🐛 Troubleshooting

### If Step 4 (test-audit) fails:

**Error: "Table 'audit_log' doesn't exist"**
- Solution: Go back to Step 1 and create the table

**Error: "Unknown model 'AuditLog'"**
- Solution: Run `npx prisma generate` (Step 2)

**Error: "Column 'performed_by' doesn't exist"**
- Solution: The table structure is wrong. Drop and recreate using Step 1 SQL

### If creating a bidder doesn't log:

1. Check terminal for error messages (they're now very detailed)
2. Verify table exists: `SHOW TABLES LIKE 'audit_log'` in phpMyAdmin
3. Check table structure: `DESCRIBE audit_log` - should match Step 1 SQL
4. Try the test endpoint: `/api/test-audit`

### If Activity page shows nothing:

1. Check if logs exist in database: `SELECT * FROM audit_log`
2. Check browser console for errors
3. Verify API route works: `http://localhost:3000/api/audit-logs`

## ✅ Success Indicators

- ✅ `/api/test-audit` returns `success: true`
- ✅ Creating a bidder shows success message in terminal
- ✅ Database query shows new rows in `audit_log` table
- ✅ `/admin/activity` page displays the logs

## 📝 Quick SQL Commands for Verification

```sql
-- Check if table exists
SHOW TABLES LIKE 'audit_log';

-- Check table structure
DESCRIBE audit_log;

-- See all audit logs
SELECT * FROM audit_log ORDER BY created_at DESC;

-- Count audit logs
SELECT COUNT(*) as total FROM audit_log;
```

