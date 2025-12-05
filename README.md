# Lazy Eye Game

A full-stack web application for lazy eye training exercises, built with NestJS backend and Next.js frontend.

## Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Database (via Neon)
- **JWT** - Authentication
- **Zod** - Request validation
- **Passport** - Authentication middleware

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TailwindCSS** - Styling
- **React Query** - Data fetching and state management
- **React Hook Form** - Form handling
- **Zod** - Form validation
- **Vitest** - Testing framework

## Prerequisites

- **Node.js** (v20 or higher recommended)
- **pnpm** - Package manager
- **PostgreSQL** database (Neon or local instance)

## Getting Started

### 1. Install Dependencies

From the root directory, install all dependencies for both frontend and backend:

```bash
pnpm run install:all
```

This command will install dependencies in the root, frontend, and backend directories.

### 2. Environment Setup

#### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-secret-key-here"
PORT=3001
```

Replace the `DATABASE_URL` with your PostgreSQL connection string (Neon or local).

#### Frontend Environment Variables

The frontend connects to the backend at `http://localhost:3001` by default. If you need to customize this, create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Database Setup

Navigate to the backend directory and set up the database:

```bash
cd backend

# Run migrations to create database schema
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

## Development

### Run Both Frontend and Backend

From the root directory:

```bash
pnpm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

### Run Frontend Only

```bash
pnpm run dev:frontend
```

### Run Backend Only

```bash
pnpm run dev:backend
```

## Testing

### Run Frontend Tests

```bash
pnpm run test:frontend
```

This runs Vitest tests for the frontend.

### Run Backend Tests

```bash
pnpm run test:backend
```

This runs Jest tests for the backend.

### Run All Tests

```bash
pnpm run test
```

This runs frontend tests by default.

## Building for Production

Build both frontend and backend:

```bash
pnpm run build
```

This will:
1. Build the Next.js frontend (output in `frontend/.next`)
2. Build the NestJS backend (output in `backend/dist`)

## Project Structure

```
lazy_eye_game/
├── backend/              # NestJS backend application
│   ├── prisma/          # Database schema and migrations
│   ├── src/             # Source code
│   │   ├── auth/        # Authentication module (JWT, Passport)
│   │   ├── prisma/      # Prisma service
│   │   └── main.ts      # Application entry point
│   └── test/            # Backend tests
├── frontend/            # Next.js frontend application
│   ├── app/             # Next.js App Router pages
│   ├── components/      # React components
│   ├── lib/             # Utilities and configurations
│   └── public/          # Static assets
├── package.json         # Root package.json with workspace scripts
└── README.md           # This file
```

## Available Scripts

All scripts can be run from the root directory:

| Command | Description |
|---------|-------------|
| `pnpm run install:all` | Install dependencies for root, frontend, and backend |
| `pnpm run dev` | Start both frontend and backend in development mode |
| `pnpm run dev:frontend` | Start only the frontend development server |
| `pnpm run dev:backend` | Start only the backend development server |
| `pnpm run build` | Build both frontend and backend for production |
| `pnpm run test` | Run frontend tests |
| `pnpm run test:frontend` | Run frontend tests with Vitest |
| `pnpm run test:backend` | Run backend tests with Jest |

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation
- [CHANGELOG.md](./CHANGELOG.md) - Project changelog

## License

Private project - All rights reserved



Email: test@example.com, Password: password123