# Task Tracker

A full-stack task management application built for a coding exam. Users can sign up, sign in, create categories, and manage tasks with search, filter, and pagination.

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite 8 (scaffolded via TanStack Start)
- TanStack Router (file-based routing)
- TanStack React Query
- Tailwind CSS v4 + shadcn/ui (New York style)
- Axios (HTTP client)
- Deployed to Vercel

### Backend
- Node.js + Express.js
- Sequelize ORM + MySQL
- JWT authentication (bcrypt password hashing)
- Deployed to Railway

## Project Structure

```
task-tracker/
├── backend/
│   ├── src/
│   │   ├── config/database.js   # Sequelize connection
│   │   ├── models/              # User, Category, Task
│   │   ├── middleware/auth.js   # JWT verification
│   │   ├── routes/              # auth, categories, tasks
│   │   ├── validators/          # Input validation helpers
│   │   ├── seed.js              # Test data seeder
│   │   └── index.js             # Express entry point
│   ├── .env.example
│   └── package.json
├── src/                         # Frontend source
│   ├── routes/                  # TanStack Router routes
│   ├── components/              # UI components
│   ├── lib/                     # API client, auth context, types
│   └── hooks/                   # Custom hooks
├── vite.config.ts
├── vercel.json
├── .gitignore
├── frontend.env.example
└── README.md
```

## Local Setup

### Prerequisites
- Node.js >= 22.12.0
- MySQL (local or Docker)
- npm

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Update the values (DB credentials, JWT secret, CORS origin).

4. Start MySQL and create the database:
   ```sql
   CREATE DATABASE task_tracker;
   ```

5. Run the seed script (creates tables + test data):
   ```bash
   npm run seed
   ```

6. Start the dev server:
   ```bash
   npm run dev
   ```
   Server runs at `http://localhost:5000`.

### Frontend

1. From the project root, install dependencies:
   ```bash
   npm install
   ```

2. Create `frontend.env` (or just `.env` at root):
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:5173`.

### Test Account (after seeding)
- Email: `test@example.com`
- Password: `password123`

## API Endpoints

All endpoints prefixed with `/api`. Protected routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/health | No | Health check |
| POST | /api/auth/register | No | Create account (name, email, password) |
| POST | /api/auth/login | No | Sign in, returns JWT |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/categories | Yes | List all categories |
| POST | /api/categories | Yes | Create category (name) |
| GET | /api/tasks | Yes | List user's tasks (supports ?status=, ?category_id=, ?search=, ?page=, ?limit=) |
| GET | /api/tasks/:id | Yes | Get one task |
| POST | /api/tasks | Yes | Create task |
| PUT | /api/tasks/:id | Yes | Update task |
| DELETE | /api/tasks/:id | Yes | Delete task |

## Deployment

### Backend → Railway

1. Create a Railway account at [railway.app](https://railway.app)
2. Create a new project and add a MySQL database
3. Connect the GitHub repository (or upload the `backend/` folder)
4. Set the following environment variables in Railway:
   - `PORT` = `5000`
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — from Railway's MySQL plugin
   - `JWT_SECRET` — a random secret string
   - `JWT_EXPIRES_IN` = `24h`
   - `CORS_ORIGIN` — your Vercel frontend URL
5. Railway will auto-detect the Node.js project and run `npm start` (which runs `node src/index.js`)
6. Run the seed script via Railway's shell or after deployment: `npm run seed`
7. Verify: `GET https://your-backend.railway.app/api/health`

### Frontend → Vercel

1. Push the repository to GitHub
2. Create a Vercel account at [vercel.com](https://vercel.com)
3. Import the GitHub repository
4. Vercel will auto-detect the framework. Set:
   - **Build Command**: `cross-env NODE_OPTIONS=--experimental-require-module vite build` (or use `npm run build`)
   - **Output Directory**: `.vercel/output` (auto-detected)
   - **Environment Variable**: `VITE_API_BASE_URL` = your Railway backend URL
5. Deploy

## Known Limitations

- Sorting is not implemented (tasks are ordered by creation date descending)
- No unit tests
- No rate limiting on login
- The frontend uses TanStack Router (not React Router DOM) — it was scaffolded with Lovable/TanStack Start which uses TanStack Router by default
- Password reset flow is not implemented