# Quick Fix for 500 Error

## If you're getting 500 errors when creating properties:

### Option 1: Check Database Tables
Make sure your `properties` table has all these columns:
- id
- map_id
- sale_id
- title
- owner
- address
- county_id
- surplus
- status
- created_at

### Option 2: Run Database Migration
Run the `database-migration.sql` file in phpMyAdmin to add missing columns.

### Option 3: Check Server Console
Look at your terminal where `npm run dev` is running. The actual error message will be printed there.

### Option 4: Test API Directly
Try this in your browser console or Postman:
```javascript
fetch('/api/properties', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test Property',
    status: 'Listed'
  })
}).then(r => r.json()).then(console.log)
```

This will show you the exact error message.

