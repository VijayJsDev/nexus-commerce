# Multi-Tenant SaaS Commerce Platform

A production-ready Multi-Tenant Software-as-a-Service (SaaS) Commerce Platform. This project is currently structured into a frontend, backend, and database layer, all orchestrated via Docker.

## 🚀 Tech Stack
- **Frontend**: React 19, Vite, TypeScript *(Pending scaffolding)*
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Infrastructure**: Docker & Docker Compose

---

## 📋 Prerequisites
Before you begin, ensure you have the following installed on your machine:
- **[Docker Desktop](https://www.docker.com/products/docker-desktop)** (Required for running the database and backend via containers).
- **[Node.js](https://nodejs.org/)** (v20+ recommended) for local development outside of Docker.

---

## 🛠️ Getting Started (Running via Docker)

The easiest way to run the application is using Docker Compose. This will automatically set up the PostgreSQL database and the Node.js backend.

1. **Ensure Docker Desktop is running.**
2. **Open your terminal** at the root of this project (`Ecommerce-SAAS-App/`).
3. **Start the containers** by running:
   ```bash
   docker compose up -d
   ```
   *(The `-d` flag runs it in detached mode so you can continue using your terminal).*

4. **Verify the backend is running:**
   Open your browser and navigate to the health check endpoint:
   [http://localhost:5000/health](http://localhost:5000/health)
   
   You should see a successful JSON response:
   ```json
   { "status": "ok", "timestamp": "...", "uptime": 12.34 }
   ```

### Useful Docker Commands
- **View Logs**: `docker compose logs -f` (Press `Ctrl+C` to exit)
- **Stop Containers**: `docker compose down`
- **Rebuild Containers**: `docker compose up --build -d` (Use this if you install new npm packages or change the `Dockerfile`).

---

## 💻 Local Development (Backend)

If you prefer to run the backend locally on your host machine (while keeping PostgreSQL in Docker):

1. **Start only the Database**:
   ```bash
   docker compose up -d postgres
   ```
2. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   *The server will start on port 5000 and automatically reload when you save files.*

### Backend Scripts
- `npm run dev`: Starts the server with hot-reloading (using `ts-node-dev`).
- `npm run build`: Compiles the TypeScript source code into the `dist/` directory.
- `npm run start`: Runs the compiled production build from `dist/server.js`.
- `npm run lint`: Analyzes the code using ESLint (v9 flat config).
- `npm run format`: Formats code using Prettier.

---

## 📂 Project Structure

```text
Ecommerce-SAAS-App/
│
├── backend/                  # Node.js / Express backend
│   ├── prisma/               # Prisma ORM schema and migrations
│   ├── src/
│   │   ├── controllers/      # HTTP Request/Response handlers
│   │   ├── middlewares/      # Custom Express middlewares
│   │   ├── routes/           # API Route definitions
│   │   ├── services/         # Core business logic
│   │   ├── utils/            # Helper functions
│   │   ├── app.ts            # Express app configuration
│   │   └── server.ts         # Server entry point
│   ├── Dockerfile            # Backend Docker image configuration
│   └── package.json
│
├── frontend/                 # React / Vite frontend (Pending)
│
├── database/                 # Database scripts/backups (if any)
│
└── docker-compose.yml        # Orchestrates the containers
```

# Database Studio
```bash
npx prisma studio --port 5555
```
