# Industrialisasi Monorepo

A full-stack application built with Turborepo, featuring a NestJS API and a React Router v7 frontend with JWT authentication and PostgreSQL database.

## Overview

Industrialisasi is a modern web application demonstrating a complete full-stack architecture with:

- **Authentication**: JWT-based authentication with local strategy
- **API**: RESTful endpoints for user and post management
- **Database**: PostgreSQL with Sqitch migrations
- **Frontend**: Modern React with server-side rendering capabilities

## Tech Stack

| Layer | Technology |
|-------|------------|
| Monorepo | [Turborepo](https://turbo.build/repo) |
| Backend | [NestJS](https://nestjs.com/) |
| Frontend | [React Router v7](https://reactrouter.com/) |
| Database | [PostgreSQL](https://www.postgresql.org/) |
| Migrations | [Sqitch](https://sqitch.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| State Management | [Redux Toolkit](https://redux-toolkit.js.org/) |
| Query Client | [TanStack Query](https://tanstack.com/query) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |

## Project Structure

```
.
├── apps/
│   ├── api/                 # NestJS API application
│   │   ├── src/
│   │   │   ├── auth/        # Authentication module (JWT, Local strategy)
│   │   │   ├── db/          # Database service
│   │   │   ├── users/       # Users module
│   │   │   └── main.ts      # Application entry point
│   │   └── package.json
│   └── ui/                  # React Router v7 frontend
│       ├── app/
│       │   ├── routes/      # Route components
│       │   ├── components/  # UI components (login, register, posts)
│       │   └── lib/         # Utility functions
│       └── package.json
├── packages/
│   └── db-migrations/       # Sqitch database migrations
└── package.json
```

## Features

### API (apps/api)

- **Authentication**: JWT-based auth with local strategy
- **Endpoints**:
  - `POST /auth/login` - User login
  - `POST /auth/logout` - User logout
  - `GET /profile` - Get authenticated user profile
  - `GET /users` - List all users
  - `GET /posts` - List all posts
  - `POST /posts` - Create a new post (authenticated)
  - `POST /seed-users` - Seed users data
  - `POST /seed-posts` - Seed posts data
  - `POST /init-schema` - Initialize database schema

### UI (apps/ui)

- **Pages**:
  - `/` - Home page with posts feed
  - `/login` - User login
  - `/register` - User registration
  - `/create-post` - Create new post (authenticated)

- **Features**:
  - Server-side rendering with React Router v7
  - Form validation with Zod
  - API integration with Axios
  - Responsive design with Tailwind CSS

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher
- [npm](https://www.npmjs.com/) 10 or higher
- [PostgreSQL](https://www.postgresql.org/) database
- [Sqitch](https://sqitch.org/) (for database migrations)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create environment files for the API:

```bash
# apps/api/.env
DATABASE_URL=postgresql://username:password@localhost:5432/industrialisasi
JWT_SECRET=your-secret-key
PORT=3000
```

### 3. Run Database Migrations

```bash
cd packages/db-migrations
sqitch deploy
```

### 4. Start Development Server

```bash
npm run dev
```

This will start both applications:
- **API**: http://localhost:3000
- **UI**: http://localhost:5173

### 5. Seed Database (Optional)

```bash
# Seed initial users
curl -X POST http://localhost:3000/seed-users

# Seed initial posts
curl -X POST http://localhost:3000/seed-posts
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build all applications and packages |
| `npm run dev` | Start development servers |
| `npm run lint` | Lint all code |
| `npm run format` | Format code with Prettier |
| `npm run clean` | Clean build artifacts and node_modules |

## API Development

Navigate to the API directory:

```bash
cd apps/api
```

### Available Commands

```bash
npm run start:dev    # Start in watch mode
npm run build        # Build for production
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run lint         # Run ESLint
```

## UI Development

Navigate to the UI directory:

```bash
cd apps/ui
```

### Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run typecheck    # Run TypeScript type checking
```

## Database Migrations

Navigate to the migrations directory:

```bash
cd packages/db-migrations
```

### Available Commands

```bash
npm run migrate      # Deploy migrations
npm run revert       # Revert migrations
npm run status       # Check migration status
npm run verify       # Verify migrations
```

## Learn More

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Router Documentation](https://reactrouter.com/dev/guides)
- [Sqitch Documentation](https://sqitch.org/documentation/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

MIT
