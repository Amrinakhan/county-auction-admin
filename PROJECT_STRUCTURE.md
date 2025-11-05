# County Auction Admin Panel - Project Structure

## 📁 Folder Structure

```
county-auction-admin/
├── prisma/
│   ├── schema.prisma          # Prisma schema with all models
│   └── seed.ts                # Seed data script
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx   # Dashboard with stats & recent properties
│   │   │   ├── counties/
│   │   │   │   └── page.tsx   # Counties CRUD page
│   │   │   ├── properties/
│   │   │   │   └── page.tsx   # Properties CRUD page with status badges
│   │   │   ├── bidders/
│   │   │   │   └── page.tsx   # Bidders CRUD page
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx   # Notifications page with read/unread toggle
│   │   │   ├── profile/
│   │   │   │   └── page.tsx   # Admin profile page
│   │   │   ├── settings/
│   │   │   │   └── page.tsx   # Settings page with toggles
│   │   │   └── layout.tsx     # Admin layout with sidebar
│   │   ├── api/
│   │   │   ├── counties/
│   │   │   │   ├── route.ts              # GET, POST counties
│   │   │   │   └── [id]/route.ts         # PUT, DELETE county
│   │   │   ├── properties/
│   │   │   │   ├── route.ts              # GET, POST properties
│   │   │   │   └── [id]/route.ts         # PUT, DELETE property
│   │   │   ├── bidders/
│   │   │   │   ├── route.ts              # GET, POST bidders
│   │   │   │   └── [id]/route.ts         # PUT, DELETE bidder
│   │   │   ├── notifications/
│   │   │   │   ├── route.ts              # GET, POST notifications
│   │   │   │   └── [id]/route.ts         # PATCH, DELETE notification
│   │   │   ├── dashboard/
│   │   │   │   ├── stats/route.ts        # Dashboard statistics
│   │   │   │   └── recent-properties/
│   │   │   │       └── route.ts         # Recent properties
│   │   │   ├── users/route.ts            # GET users
│   │   │   ├── properties/route.ts       # GET properties
│   │   │   ├── bids/route.ts            # GET bids
│   │   │   └── test/route.ts            # Test DB connection
│   │   ├── layout.tsx                    # Root layout
│   │   └── page.tsx                      # Root page (redirects to dashboard)
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── table.tsx
│   │       ├── dialog.tsx                 # Modal component
│   │       ├── select.tsx                # Dropdown select
│   │       ├── badge.tsx                 # Status badges
│   │       ├── switch.tsx                # Toggle switches
│   │       ├── label.tsx                 # Form labels
│   │       ├── input.tsx
│   │       ├── alert.tsx
│   │       ├── skeleton.tsx
│   │       └── sidebar.tsx
│   └── lib/
│       ├── prisma.ts                     # Prisma client singleton
│       └── utils.ts                      # Utility functions
└── database.sql                          # SQL schema file
```

## 🗄️ Database Models

### User
- id, name, email, phone, role, status, county, created_at

### County
- id, name, contact_name, contact_email, subscription_status, created_at

### Property
- id, map_id, sale_id, title, owner, address, county_id, surplus, status, created_at

### Bid
- id, user_id, property_id, item_name, bid_amount, status, created_at

### Account
- id, user_id, balance, last_transaction, updated_at

### Notification
- id, title, type, is_read, created_at

## 🎨 Features Implemented

### ✅ Dashboard Page
- 4 statistic cards (Total Counties, Properties, Bidders, Active Bids)
- Recent properties table (5 most recent)
- Uses SWR for data fetching

### ✅ Counties Page
- Full CRUD operations
- Modal form with validation
- Subscription status dropdown
- Edit/Delete actions

### ✅ Properties Page
- Full CRUD operations
- Color-coded status badges:
  - Listed = blue
  - Sold = green
  - Redeemed = yellow
  - Processing = orange
  - Check Issued = gray
- County selection dropdown

### ✅ Bidders Page
- Full CRUD operations
- Filter by role = "bidder"
- County selection dropdown
- Form validation with Zod

### ✅ Notifications Page
- Read/Unread toggle switch
- Status badges
- Type display

### ✅ Profile Page
- Admin information display
- Edit Profile button (placeholder)

### ✅ Settings Page
- Dark mode toggle (localStorage)
- Email notifications toggle (localStorage)

## 🔧 Technologies Used

- **Next.js 14** (App Router)
- **TypeScript**
- **Prisma ORM** (MySQL)
- **SWR** (Data fetching)
- **React Hook Form** + **Zod** (Form validation)
- **shadcn/ui** (UI components)
- **Tailwind CSS** (via shadcn)

## 📝 API Routes

All API routes follow RESTful conventions:
- GET `/api/{resource}` - List all
- POST `/api/{resource}` - Create new
- GET `/api/{resource}/[id]` - Get by ID
- PUT `/api/{resource}/[id]` - Update
- DELETE `/api/{resource}/[id]` - Delete
- PATCH `/api/{resource}/[id]` - Partial update (notifications)

## 🚀 Setup Instructions

1. Run `database.sql` in phpMyAdmin to create tables
2. Run `npx prisma generate` to generate Prisma client
3. Run `npx prisma db push` to sync schema
4. Run `npm run dev` to start development server

