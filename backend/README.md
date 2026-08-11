# Mini ERP + CRM Operations Portal - Backend API

Production-ready, highly reliable, and scalable backend REST API for a wholesale/distribution company. Built using Node.js, TypeScript, Express, Prisma ORM, and Zod validation.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js v18+ & TypeScript
- **Framework**: Express.js
- **Database ORM**: Prisma ORM (SQLite for local zero-config, PostgreSQL compatible for deployment)
- **Validation**: Zod
- **Authentication**: JWT & Bcrypt password hashing
- **Role-Based Access Control (RBAC)**: Custom middleware supporting `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`

---

## 🔑 Test Login Credentials (Seeded)

All seeded accounts use password: **`Password123`**

| Role | Email | Permissions |
| :--- | :--- | :--- |
| **Admin** | `admin@erp.com` | Full System Access |
| **Sales** | `sales@erp.com` | Customers, Create/View Sales Challans |
| **Warehouse** | `warehouse@erp.com` | Products, Stock Adjustments, View Sales Challans |
| **Accounts** | `accounts@erp.com` | View Customers, View Sales Challans, Reports |

---

## 📁 Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts                 # Validated env loader (Zod)
│   │   └── db.ts                  # Prisma Client singleton
│   ├── modules/
│   │   ├── auth/                  # Login & Auth endpoints
│   │   ├── customers/             # CRM & Follow-ups
│   │   ├── products/              # Inventory & Stock audit logs
│   │   └── challans/              # Sales Challans (Atomic Transactions)
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT Bearer token authentication
│   │   ├── role.middleware.ts     # Role RBAC middleware
│   │   ├── error.middleware.ts    # Centralized custom error handler
│   │   └── validate.middleware.ts # Zod request validation
│   ├── utils/
│   │   ├── ApiError.ts            # Custom operational error class
│   │   ├── asyncHandler.ts        # Express async wrapper
│   │   └── generateChallanNo.ts   # Unique Challan ID generator
│   ├── types/
│   │   └── express.d.ts           # Extended Express Request type
│   ├── app.ts                     # Express App & Router Wiring
│   └── server.ts                  # Server entry point
├── prisma/
│   ├── schema.prisma              # Database schema & indexes
│   └── seed.ts                    # Seeder script
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🚀 Quick Setup & Local Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Push Database Schema
```bash
npx prisma db push
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
The server will start at `http://localhost:5000`.

---

## ⚡ API Endpoint Summary

### Authentication (`/api/v1/auth`)
- `POST /login` - User authentication (returns JWT token)
- `GET /me` - Get current authenticated user profile

### Customer CRM (`/api/v1/customers`)
- `POST /` - Add new customer (`ADMIN`, `SALES`)
- `GET /` - List customers with search & pagination (`search`, `status`, `type`, `page`, `limit`)
- `GET /:id` - View customer details with follow-up & challan history
- `PUT /:id` - Update customer details (`ADMIN`, `SALES`)
- `POST /:id/follow-ups` - Add follow-up note (`ADMIN`, `SALES`)

### Product & Inventory (`/api/v1/products`)
- `POST /` - Add product (`ADMIN`, `WAREHOUSE`)
- `GET /` - List products with search, category filter, and low-stock filter
- `GET /:id` - View product details & stock movement history
- `PUT /:id` - Edit product (`ADMIN`, `WAREHOUSE`)
- `POST /:id/stock` - Adjust stock IN/OUT with reason (`ADMIN`, `WAREHOUSE`)
- `GET /stock-movements/logs` - Append-only stock audit logs

### Sales Challan (`/api/v1/challans`)
- `POST /` - Create Sales Challan (`DRAFT` or `CONFIRMED`) with product price/name snapshot (`ADMIN`, `SALES`)
- `GET /` - List sales challans with search & status filter
- `GET /:id` - View detailed Sales Challan
- `PATCH /:id/status` - Change status (`DRAFT` -> `CONFIRMED` or `CONFIRMED` -> `CANCELLED`) (`ADMIN`, `SALES`, `WAREHOUSE`)

---

## 🔒 Business Logic Highlights

1. **Atomic Stock Transactions**:
   Updating or creating a `CONFIRMED` Sales Challan runs inside an atomic `prisma.$transaction`. Stock availability is verified prior to deduction, preventing negative stock levels.
2. **Product Snapshotting**:
   Challans preserve item pricing, product names, and SKUs at creation time, preserving historical integrity regardless of future product updates.
3. **Audit Logging**:
   Every stock addition, reduction, or sales challan deduction produces an append-only `StockMovement` entry linked to the performing user.
