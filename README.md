# Industrialisasi Monorepo

A Turborepo monorepo containing the Industrialisasi project applications and packages.

## What's Inside?

This monorepo uses [Turborepo](https://turbo.build/repo) and includes:

### Apps
- `apps/api` - [NestJS](https://nestjs.com/) API backend
- `apps/ui` - [React Router v7](https://reactrouter.com/) frontend application

### Packages
- `packages/db-migrations` - [Sqitch](https://sqitch.org/) database migrations

## Utilities

This Turborepo has some additional tools:

### Build
To build all apps and packages, run the following command:

```bash
npm run build
```

### Develop
To develop all apps and packages, run the following command:

```bash
npm run dev
```

### Lint
To lint all apps and packages, run the following command:

```bash
npm run lint
```

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm

### Installation

```bash
npm install
```

### Running the Application

Start both the API and UI in development mode:

```bash
npm run dev
```

The applications will be available at:
- API: http://localhost:3000 (or configured port)
- UI: http://localhost:5173 (Vite dev server)

## Project Structure

```
.
├── apps/
│   ├── api/          # NestJS API
│   └── ui/           # React Router v7 UI
├── packages/
│   └── db-migrations/ # Sqitch database migrations
├── package.json
└── turbo.json
```

## Learn More

To learn more about the technologies used:

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Router Documentation](https://reactrouter.com/dev/guides)
- [Sqitch Documentation](https://sqitch.org/)
