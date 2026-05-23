# ⚡ VibeLumen | Telegram-like Premium Chat App

Welcome to **VibeLumen**, a fully featured, state-of-the-art, Telegram-like real-time messaging application. Built with a robust full-stack TS/JS ecosystem, rich aesthetics, and structured using clean architecture patterns.

---

## 🎨 Premium Color System
Throughout the application layout, a cohesive palette has been strictly applied:
- `Primary Dark / Text`: **#000000** (`bg-vibe-dark`, `text-vibe-dark`)
- `Muted UI elements / Secondary text`: **#586F7C** (`text-vibe-muted`, `border-vibe-muted`)
- `Accent / Active highlights`: **#B8DBD9** (`text-vibe-accent`, `bg-vibe-accent`)
- `Background surface`: **#F4F4F9** (`bg-vibe-bg`)
- `Primary action color / Buttons / Indicators`: **#04724D** (`bg-vibe-primary`, `border-vibe-primary`)

---

## 🛠️ Tech Stack & Architecture

```mermaid
graph TD
    Client[React + Vite Frontend] <-->|HTTP REST / Cookies| Server[Express Server]
    Client <-->|WebSockets room events| SocketServer[Socket.io Server]
    Server -->|Prisma Client| DB[(PostgreSQL Database)]
    SocketServer -->|Prisma Client| DB
```

### 💻 Frontend (Client)
- **Vite + React (TSX)**: Ultra-fast hot module reloading and TypeScript safety.
- **Tailwind CSS**: Custom color-system configurations for spacing, glassmorphic panels, and transitions.
- **Ant Design (antd)**: Used for high-quality inputs, badges, avatars, and modals.
- **Zustand**: Clean, centralized stateless client store managing session, joined channels, and incoming socket messages.
- **Socket.io-client**: Connected directly to the backend for real-time bidirectional messaging.

### ⚙️ Backend (Server)
- **Express.js**: Sessionless REST routing endpoint.
- **Socket.io (server)**: Room partitioning based on Channel UUIDs, providing low-latency broadcasts.
- **Passport.js + Google OAuth 2.0**: Stateless third-party login flow.
- **JWT (JsonWebToken)**: Signed with `id` expiration, stored in a HTTP-only Cookie for security (or optional Bearer Token).
- **Prisma ORM**: Relational schema modeling `User`, `Chat`, `ChatMember` (joining relationships), and `Message` tables on **PostgreSQL**.

---

## 📂 Codebase File Structure
The project is perfectly divided into two self-contained TS folders with a centralized root launcher:

```text
├── client/                     # React Single Page App
│   ├── src/
│   │   ├── components/         # Reusable UI Blocks (Sidebar, UserBadge, bubbles...)
│   │   ├── pages/              # Routing panels (AuthPage, AuthCallback, MainPage)
│   │   ├── services/           # Axios REST configurations with withCredentials
│   │   ├── store/              # Zustand global state store
│   │   ├── index.css           # Tailwind base + custom scrollbar & overlays
│   │   ├── main.tsx            # DOM root mounting
│   │   └── App.tsx             # Route orchestration & Session restoration
│   ├── tailwind.config.js      # Theme extensions with theme hex-colors
│   └── package.json
│
├── server/                     # Node.js Express App
│   ├── src/
│   │   ├── config/             # Passport, Prisma instances
│   │   ├── middlewares/        # JWT Authentication guard
│   │   ├── routes/             # REST controller routes (Auth, Chats, Messages)
│   │   ├── socket/             # Room managers and broadcasts
│   │   └── index.ts            # Entrypoint boots REST + Socket servers
│   ├── prisma/
│   │   └── schema.prisma       # Database structures
│   ├── .env                    # Secrets and environment configs
│   └── package.json
│
└── package.json                # Root concurrently workspace script launcher
```

---

## 🚀 Execution & Setup Guide

### 1. Database Setup
Ensure you have a running PostgreSQL database. You can launch one with Docker easily:
```bash
docker run --name vibe-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=vibe_lumen -p 5432:5432 -d postgres
```

### 2. OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and set up your **OAuth Consent Screen**.
3. Under **Credentials**, create an **OAuth client ID** for a Web Application.
4. Set Authorized redirect URIs to: `http://localhost:5000/auth/google/callback`.
5. Copy your **Client ID** and **Client Secret**.

### 3. Environment Variables
Open `/server/.env` and update the database and Google login secrets:
```ini
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vibe_lumen?schema=public"
JWT_SECRET="YOUR_SUPER_SECRET_KEY"
GOOGLE_CLIENT_ID="PASTE_YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="PASTE_YOUR_GOOGLE_CLIENT_SECRET"
```

### 4. Install & Launch
Run the workspace setup script in the root directory to install all packages and boot up the development servers:
```bash
# Install client and server packages
npm run install:all

# Initialize and generate Prisma Database client
cd server
npx prisma db push
npx prisma generate
cd ..

# Boot client (5173) and server (5000) concurrently
npm run dev
```

---

## ✨ Features Highlight

1. **Google OAuth & Handle Generation**: On initial Google Sign-in, the server checks database collisions and registers the user, appending `@user_` plus 6 random alphanumeric characters (e.g. `@user_n9a2c3`).
2. **Global Channels Search**: Users can search all public rooms in the system by room name. Clicking a channel they haven't joined yet pops up a premium, responsive glassmorphic joining modal.
3. **Room-Based WebSockets**: Users join custom Socket.io rooms keyed by the Chat UUID when clicking a room. Chat messages are persisted directly in PostgreSQL and broadcast to active room participants in real time.
4. **Session Persistence**: App checks JWT cookies on boot. If present, it restores the session smoothly without causing login screen flashes.
