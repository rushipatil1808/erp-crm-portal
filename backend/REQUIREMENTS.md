# System Requirements & VS Code Troubleshooting Guide

## 📋 System Prerequisites

| Component | Required Version | Status on Your Machine |
| :--- | :--- | :--- |
| **Node.js** | v18.0.0 or higher | ✅ Installed (`v24.19.0` at `C:\Program Files\nodejs\`) |
| **npm** | v9.0.0 or higher | ✅ Installed (`C:\Program Files\nodejs\npm.cmd`) |
| **Database** | SQLite (Default) / PostgreSQL | ✅ Ready (`prisma/dev.db` created & seeded) |
| **OS** | Windows 10/11 | ✅ Compatible |

---

## ❓ Why does VS Code show `npm : The term 'npm' is not recognized`?

### Root Cause
When Node.js is installed on Windows, it adds `C:\Program Files\nodejs\` to your Windows System PATH. However, **already open VS Code terminal windows keep using the old PATH environment from when VS Code was first launched**.

Because your VS Code was open while Node.js was being installed, your current VS Code terminal tab does not see `npm` yet.

---

## 🛠️ How to Fix & Run the Project in VS Code

### Method 1: Instant Fix (Without closing VS Code)

In your current VS Code terminal, run the following two commands:

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
npm run dev
```

---

### Method 2: Restart VS Code Terminal (Permanent Fix)

1. Close your current terminal tab in VS Code by clicking the **Trash Can icon** 🗑️ in the bottom right terminal panel.
2. Open a new terminal (`Ctrl + Shift + ~` or `Terminal -> New Terminal`).
3. Run:
   ```powershell
   cd backend
   npm run dev
   ```

---

### Method 3: Restart VS Code Completely

1. Close the entire VS Code window (`Alt + F4`).
2. Open VS Code again.
3. Open terminal (`Ctrl + ~`) and run:
   ```powershell
   cd backend
   npm run dev
   ```

---

## ✅ Expected Output when running `npm run dev`

```text
> erp-crm-backend@1.0.0 dev
> ts-node-dev --respawn --transpile-only src/server.ts

🚀 ERP/CRM Backend running on http://localhost:5000 in development mode
```
