# 🏢 Mini ERP + CRM Operations Portal

A full-stack **Wholesale & Distribution ERP + CRM Portal** built with **React**, **Node.js/Express**, **Prisma ORM**, and **PostgreSQL (Supabase)**.

---

## 🔗 Live Deployment Links

| Part | Platform | URL |
|------|----------|-----|
| 🌐 Frontend | Vercel | [https://erp-crm-portal-one.vercel.app](https://erp-crm-portal-one.vercel.app) |
| ⚙️ Backend API | Render | [https://erp-crm-portal-cm83.onrender.com](https://erp-crm-portal-cm83.onrender.com) |
| 🗄️ Database | Supabase | Connected via Transaction Pooler (`?pgbouncer=true`) |

---

## 🔑 Test Login Credentials

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | `admin@erp.com` | `Password123` |
| 💼 Sales Staff | `sales@erp.com` | `Password123` |
| 📦 Warehouse Mgr | `warehouse@erp.com` | `Password123` |
| 🧾 Accounts Exec | `accounts@erp.com` | `Password123` |

---

## 🏗️ Architecture Overview

```
erp-crm-portal/
├── frontend/              # React + Vite + TypeScript (Vercel)
│   ├── src/
│   │   ├── api/           # API client (client.ts)
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth context & state
│   │   └── pages/         # Dashboard, CRM, Inventory, Challans
│   └── vite.config.ts
│
├── backend/               # Express + TypeScript + Prisma (Render)
│   ├── src/
│   │   ├── modules/       # Auth, Customers, Products, Challans
│   │   ├── middleware/     # Auth, Role, Error, Validate
│   │   ├── config/        # DB, Env config
│   │   └── utils/         # ApiError, asyncHandler
│   └── prisma/
│       ├── schema.prisma  # PostgreSQL DB schema
│       └── seed.ts        # Demo data seeder
│
└── postman_collection.json   # Full API test collection
```

**Tech Stack:**
- **Frontend**: React 18, TypeScript, Vite, Lucide Icons, Vanilla CSS
- **Backend**: Node.js 18+, Express 4, TypeScript, Zod validation
- **ORM**: Prisma 5 (PostgreSQL)
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (frontend), Render (backend), Supabase (DB)

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 18+
- npm 9+
- A free [Supabase](https://supabase.com) account for the database

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/erp-crm-portal.git
cd erp-crm-portal
```

### Step 2: Setup the Database (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Once created, go to **Settings → Database → Connection String**.
3. Copy the **Transaction Pooler** URL (for `DATABASE_URL`) and the **Direct Connection** URL (for `DIRECT_URL`).

### Step 3: Configure Backend Environment
```bash
cd backend
cp .env.example .env
```
Edit `.env` and fill in:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
JWT_SECRET="your-super-secret-jwt-key-minimum-32-chars"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
CORS_ORIGINS="http://localhost:3000"
```

### Step 4: Install Dependencies & Migrate Database
```bash
# In /backend
npm install
npx prisma generate
npx prisma db push
npm run seed
```

### Step 5: Configure Frontend Environment
```bash
cd ../frontend
# No .env needed for local development (Vite proxies /api → localhost:5000)
npm install
```

### Step 6: Run Both Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App running at http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) and log in with any test account above.

---

## 🚀 Deployment Guide

### 🗄️ Step 1: Supabase (Database)

1. Create a project at [supabase.com](https://supabase.com).
2. Note your **Database Password**, **Project Ref**, and **Connection Strings**.
3. You'll use these in Step 2 & 3.

---

### ⚙️ Step 2: Render (Backend)

1. Go to [render.com](https://render.com) and sign up with GitHub.
2. Click **New → Web Service** → Connect your GitHub repository.
3. Set the following:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

4. Add these **Environment Variables** in Render dashboard:
   ```
   DATABASE_URL      = [Supabase Transaction Pooler URL]
   DIRECT_URL        = [Supabase Direct Connection URL]
   JWT_SECRET        = [your-random-64-char-secret]
   JWT_EXPIRES_IN    = 7d
   NODE_ENV          = production
   CORS_ORIGINS      = https://your-frontend.vercel.app
   PORT              = 5000
   ```

5. Deploy! After success, note your backend URL: `https://your-service-name.onrender.com`.

6. **Seed the database** (one-time): In Render dashboard → Shell tab:
   ```bash
   npm run seed
   ```

---

### 🌐 Step 3: Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub.
2. Click **New Project** → Import your repository.
3. Set:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add this **Environment Variable**:
   ```
   VITE_API_BASE_URL = https://your-backend-name.onrender.com
   ```
5. Deploy! Your frontend URL will be: `https://your-project.vercel.app`

6. **Update CORS on Render**: Go back to Render → Update the `CORS_ORIGINS` env var to your actual Vercel URL:
   ```
   CORS_ORIGINS = https://your-project.vercel.app
   ```
   Then redeploy the backend.

---

## 🌍 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Supabase PostgreSQL pooled connection URL |
| `DIRECT_URL` | ✅ | Supabase direct connection URL (for migrations) |
| `JWT_SECRET` | ✅ | Random secret string (min 32 chars) |
| `JWT_EXPIRES_IN` | ✅ | Token expiry duration (e.g. `7d`) |
| `PORT` | ✅ | Server port (default: `5000`) |
| `NODE_ENV` | ✅ | `development` or `production` |
| `CORS_ORIGINS` | ✅ | Comma-separated allowed frontend origins |

### Frontend (`frontend/.env.production`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | ✅ | Full Render backend URL (no trailing slash) |

---

## 📋 API Documentation

Import `postman_collection.json` into Postman for the full API documentation.

### Key Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/auth/login` | None | Login and get JWT token |
| `GET` | `/api/v1/auth/me` | JWT | Get current user info |
| `GET` | `/api/v1/customers` | JWT | List all customers |
| `POST` | `/api/v1/customers` | Admin/Sales | Create customer |
| `PUT` | `/api/v1/customers/:id` | Admin/Sales | Update customer |
| `DELETE` | `/api/v1/customers/:id` | Admin/Sales | Delete customer |
| `GET` | `/api/v1/products` | JWT | List all products |
| `POST` | `/api/v1/products` | Admin/Warehouse | Create product |
| `POST` | `/api/v1/products/:id/stock` | Admin/Warehouse | Adjust stock |
| `GET` | `/api/v1/products/stock-movements/logs` | JWT | Stock audit logs |
| `DELETE` | `/api/v1/products/:id` | Admin/Warehouse | Delete product |
| `GET` | `/api/v1/challans` | JWT | List all challans |
| `POST` | `/api/v1/challans` | Admin/Sales | Create challan |
| `PATCH` | `/api/v1/challans/:id/status` | Admin/Sales/Warehouse | Update status |
| `DELETE` | `/api/v1/challans/:id` | Admin/Sales | Delete challan |

---

## ✨ Features Implemented

### 1. 🔐 Authentication & Role-Based Access (PDF Module 1)
- JWT-based login with bcrypt password hashing.
- **4 distinct roles**: Admin, Sales, Warehouse, Accounts.
- Role-specific sidebar navigation, dashboard KPIs, and quick actions.
- Protected API routes with `requireRole()` middleware.

### 2. 👥 Customer CRM (PDF Module 2)
- Create, View, Update, Delete customers.
- Customer types: Retail, Wholesale, Distributor.
- Status tracking: Lead → Active → Inactive.
- Follow-up notes timeline with date scheduling.
- Search, filter by type & status.

### 3. 📦 Product & Inventory Management (PDF Module 3)
- Full product catalog with SKU codes & category management.
- Predefined category dropdown + custom category entry.
- Stock In/Out adjustment with reason logging.
- Low stock alert badges (when stock ≤ minStockAlert).
- Complete Stock Movement Audit Log feed.

### 4. 📋 Sales Challans / Delivery Orders (PDF Module 4)
- Auto-generated sequential challan numbers (`#CH-2026-00001`).
- Multi-product challan creation with real-time stock availability checks.
- Status workflow: `DRAFT → CONFIRMED → CANCELLED`.
- Stock auto-deduction on CONFIRMED, auto-restoration on CANCELLED/Delete.
- Printable official Delivery Challan invoice view.

### 5. 🚀 Production Scalability & Security
- **Traffic Control (express-rate-limit)**: Global rate limiting (100 requests / 15m) and strict Brute-Force protection on the login route (5 attempts / 15m).
- **Security Headers (helmet)**: Protection against XSS, clickjacking, and sniffing via 14 secure HTTP headers.
- **Payload Compression (compression)**: Gzip compression applied to all API responses for lightning-fast dashboard data loading.
- **Dockerized Architecture**: Multi-stage `Dockerfile` and `docker-compose` set up for consistent local and production parity.

---

## ⚠️ Known Limitations

1. **No file uploads**: Product image upload to S3 is not implemented (bonus feature).
2. **No PDF export**: PDF invoice export not implemented (bonus feature).
3. **Render Free Tier**: Backend may have cold-start delays (~30s) on first request after inactivity.
4. **No pagination UI**: Pagination state management is not implemented in the frontend table views.

---

## 🛠️ Assumptions Made

1. JWT is stored in `localStorage` (acceptable for an internal ERP tool).
2. Challan numbers are auto-generated server-side using sequential counters.
3. Stock deduction happens only when challan status is `CONFIRMED`, not `DRAFT`.
4. Deleting a `CONFIRMED` challan automatically restores the product stock.
5. All roles can view challans, customers, and products (read access). Write access is role-restricted.
