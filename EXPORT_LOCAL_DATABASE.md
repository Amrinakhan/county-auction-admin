# Export Your Local Database

## Step-by-Step: Export from phpMyAdmin

1. **Open phpMyAdmin** (you're already there!)

2. **Select your database**:
   - Click on `county_admin` in the left sidebar

3. **Export the database**:
   - Click on the **"Export"** tab at the top
   - Method: Select **"Quick"** (or "Custom" for more options)
   - Format: **SQL**
   - Click **"Go"** button
   - This will download a `.sql` file

4. **Save the file**:
   - Save it as `county_admin_backup.sql`
   - Keep it safe - you'll need it to import to cloud database

## Alternative: Using Command Line

If you prefer command line:

```bash
mysqldump -u root -p county_admin > county_admin_backup.sql
```

Enter your MySQL password when prompted.

---

**Next Step**: Set up a cloud database (PlanetScale or Railway) and import this SQL file.

