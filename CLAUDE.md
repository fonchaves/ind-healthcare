# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack healthcare monitoring application displaying SRAG (Severe Acute Respiratory Syndrome) data metrics and visualizations. Built for the Ind. technical challenge using OpenDataSUS dataset (2019-2025).

## Tech Stack

- **Backend**: NestJS 11 + TypeScript 5.7 + PostgreSQL 15 + Prisma 6
- **Frontend**: Next.js 15 + React 19 + Tailwind CSS 4 + Recharts 3
- **Package Manager**: pnpm (required for both projects)
- **Infrastructure**: Docker Compose for PostgreSQL

## Monorepo Structure

```
/backend/          # NestJS REST API with Prisma
  src/
    database/      # Prisma service + seed logic
    metrics/       # Dashboard metrics module
    charts/        # Chart data module
  prisma/
    schema.prisma  # Database schema
/frontend/         # Next.js application
  src/
    app/           # App Router pages
    components/    # React components (dashboard/)
    services/      # API client (axios)
    types/         # TypeScript type definitions
/docs/
  datasource/
    partial/       # Development dataset (subset)
    full/          # Production dataset (complete)
```

## Development Setup

### 1. Start PostgreSQL
```bash
docker-compose up -d
```

### 2. Backend Setup (`/backend`)
```bash
pnpm install
cp .env.example .env
pnpm exec prisma migrate dev     # Run migrations
pnpm run seed                    # Import partial dataset (dev)
# OR: pnpm run seed:full          # Import full dataset (prod)
pnpm run start:dev               # Start on port 3001
```

Backend runs at `http://localhost:3001`
- API root: `http://localhost:3001/api`
- Swagger docs: `http://localhost:3001/api/docs`

### 3. Frontend Setup (`/frontend`)
```bash
pnpm install
cp .env.example .env.local
pnpm run dev                     # Start on port 3000
```

Frontend runs at `http://localhost:3000`

## Common Commands

### Backend
```bash
# Development
pnpm run start:dev               # Watch mode
pnpm run start:debug             # Debug mode

# Database
pnpm exec prisma migrate dev     # Create and apply migration
pnpm exec prisma studio          # Open Prisma Studio GUI
pnpm run seed                    # Seed with partial data (dev)
pnpm run seed:full               # Seed with full data (dev)
pnpm run seed:prod               # Seed with partial data (production/Docker)
pnpm run seed:prod:full          # Seed with full data (production/Docker)

# Testing
pnpm run test                    # Unit tests
pnpm run test:watch              # Watch mode
pnpm run test:cov                # Coverage report
pnpm run test:e2e                # E2E tests

# Build
pnpm run build
pnpm run start:prod

# Code quality
pnpm run format                  # Prettier
pnpm run lint                    # ESLint
```

### Frontend
```bash
pnpm run dev                     # Dev with Turbopack
pnpm run build                   # Production build with Turbopack
pnpm run start                   # Production server
pnpm run lint                    # ESLint
```

## Architecture

### Backend Architecture

**Module Structure:**
- **DatabaseModule**: Prisma service, available globally to all modules
- **MetricsModule**: Calculates dashboard metrics (growth rate, mortality, ICU, vaccination)
- **ChartsModule**: Provides time-series data with filtering/grouping capabilities

**Data Flow:**
1. CSV files imported via `SeedService` (supports partial/full datasets)
2. Data stored in PostgreSQL via Prisma ORM
3. Controllers handle HTTP requests, call services for business logic
4. Services query database using Prisma Client (type-safe)
5. DTOs validate and transform data (class-validator, class-transformer)
6. Swagger auto-generates API documentation from decorators

**Database Schema:**
- Single `SragCase` model with ~21 essential fields (simplified from 194 CSV columns)
- Key municipality fields:
  - `municipality`: IBGE code (ex: "355030") - used for efficient filtering
  - `municipalityName`: Display name from ID_MUNICIP CSV field (ex: "SAO PAULO") - used for visualization
- Indexed on: `state + notificationDate`, `notificationDate`, `evolution`
- Fields cover: notification, location, demographics, hospitalization, vaccination, outcomes

**Seed Strategy:**
- Environment variable `USE_FULL_DATA` controls dataset size
- **Development commands** (requires ts-node):
  - `pnpm run seed`: Uses `/docs/datasource/partial/` (subset for fast development)
  - `pnpm run seed:full`: Uses `/docs/datasource/full/` (complete dataset)
- **Production commands** (uses compiled JavaScript):
  - `pnpm run seed:prod`: Uses `/docs/datasource/partial/` (for testing production build)
  - `pnpm run seed:prod:full`: Uses `/docs/datasource/full/` (for production deployment)
- Imports `ID_MUNICIP` field from CSV for human-readable municipality names
- Batch inserts (100 records/batch) to optimize memory
- CSV parsing handles semicolon-separated files with multiple date formats

**API Endpoints:**
- `GET /api/metrics/dashboard`: Returns 4 metrics with values and context
- `GET /api/charts/cases`: Time-series data with query params (period, groupBy, state, municipality)
  - Returns municipality names (not codes) when groupBy=municipality
- `GET /api/charts/states`: Returns list of all available states (for filter dropdown)
- `GET /api/charts/municipalities`: Returns list of all municipalities with {code, name} for filter dropdown

### Frontend Architecture

**Component Hierarchy:**
```
page.tsx (Main dashboard page)
  └─ MetricsGrid
       └─ MetricCard (4 instances)
  └─ ChartFilters
  └─ CasesChart (Recharts LineChart)
```

**Data Fetching:**
- API calls via axios client in `/services/api.ts`
- React hooks (`useState`, `useEffect`) manage filters and data
- No server-side rendering for dashboard (client-side data fetching)
- Independent fetching of states and municipalities on mount for filter dropdowns
- Chart data fetching respects municipality filter requirement

**Dynamic Filtering:**
- Filter dropdown adapts based on `groupBy` selection:
  - **State grouping**: Shows "Estado (opcional)" with state options
  - **Municipality grouping**: Shows "Município (obrigatório)" with municipality options
- Municipality filter is **required** when groupBy=municipality to prevent illegible charts
- Filter persistence: Last selected state/municipality is restored when switching between groupings
- Automatic validation: Chart won't load until municipality is selected when required

**Responsiveness:**
- **MetricsGrid**: 1 column (mobile) → 2 columns (tablet) → 4 columns (desktop)
- **CasesChart**: Uses Recharts `ResponsiveContainer`, adapts to viewport
- Tailwind breakpoints: `md:` (768px), `xl:` (1280px)
- Visual feedback: Red border/background on municipality select when empty

**Type Safety:**
- Shared types in `/types/metrics.ts` and `/types/charts.ts`
- Match backend DTOs for consistency

### Port Configuration

- **Backend**: Port 3001 (configured in `.env` via `PORT` variable)
- **Frontend**: Port 3000 (Next.js default)
- **PostgreSQL**: Port 5432 (Docker Compose)

### CORS Configuration

Backend allows requests from `http://localhost:3000` by default. Override via `CORS_ORIGIN` environment variable in production.

## Data Source

- **Dataset**: OpenDataSUS SRAG 2019-2025
- **URL**: https://opendatasus.saude.gov.br/dataset/srag-2021-a-2024
- **Dictionary**: `/docs/datasource/dicionario-de-dados-2019-a-2025.pdf`
- **Format**: CSV files with semicolon separator, ~194 columns (schema uses ~20)

## Testing

Backend uses Jest with the following configuration:
- Unit tests: `*.spec.ts` files alongside source code
- E2E tests: `/test` directory with `jest-e2e.json` config
- Coverage: Collects from all `.ts` files in `/src`
- Current coverage: Metrics and Charts services have unit tests

## Deployment

### CapRover Deployment (Recommended for Production)

The backend is fully configured for CapRover deployment with automatic seeding and migrations.

**Quick Start:**
```bash
npm install -g caprover
caprover login
cd backend
caprover deploy
```

**Key Features:**
- PostgreSQL via One-Click App
- Automatic Prisma migrations
- Automatic seed on first deploy (checks if database is empty)
- Health checks configured
- HTTPS with Let's Encrypt
- Zero-downtime deployments

**Required Configuration:**
1. Create PostgreSQL app: `ind-healthcare-db` (One-Click App)
2. Create backend app: `ind-healthcare-api`
3. Set environment variables:
   - `DATABASE_URL`: Connection string to PostgreSQL
   - `PORT`: 3001
   - `NODE_ENV`: production
   - `CORS_ORIGIN`: Frontend URL
   - `USE_FULL_DATA`: true

**Files:**
- `captain-definition`: CapRover configuration
- `scripts/docker-entrypoint.sh`: Startup script with automatic seeding logic
- `Dockerfile`: Multi-stage build optimized for CapRover

**Detailed Guide:** See [DEPLOY_CAPROVER.md](../DEPLOY_CAPROVER.md) for complete instructions.

### Docker Deployment (Local Development)

The backend includes a production-ready multi-stage Dockerfile optimized for size and security.

**Start with Docker Compose:**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL 15 on port 5432
- Backend API on port 3001

**Docker Compose includes:**
- Health checks for both services
- Automatic Prisma migrations on startup
- Non-root user execution (security)
- Persistent volume for PostgreSQL data
- Shared network for service communication

**Manual Docker Build:**
```bash
cd backend
docker build -t srag-backend .
docker run -p 3001:3001 \
  -e DATABASE_URL=postgresql://... \
  -e PORT=3001 \
  -e NODE_ENV=production \
  -e CORS_ORIGIN=https://your-frontend.com \
  srag-backend
```

**Dockerfile Features:**
- **Stage 1 (deps)**: Installs dependencies and generates Prisma Client
- **Stage 2 (builder)**: Compiles TypeScript to JavaScript
- **Stage 3 (runner)**: Production runtime with minimal footprint
- Runs as non-root user (`nestjs:nodejs`)
- Automatic migrations via `prisma migrate deploy`
- Health check on HTTP port 3001

### Vercel Deployment (Frontend)

The frontend is optimized for Vercel deployment with Next.js 15.

**Deployment Steps:**

1. **Push to GitHub** (if not already done)
2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - Set root directory to `frontend`
3. **Configure Environment Variables:**
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com
   ```
4. **Deploy:** Vercel will automatically detect Next.js and use the `vercel.json` configuration

**vercel.json Configuration:**
- Framework: Next.js
- Build command: `pnpm run build`
- Install command: `pnpm install`
- Region: `gru1` (São Paulo, Brazil - optimal for Brazilian users)

**Custom Domain:** Configure in Vercel dashboard after deployment.

### Environment Variables

**Backend (`.env` or Docker env vars):**
```env
DATABASE_URL=postgresql://user:password@host:5432/database
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
USE_FULL_DATA=true
```

**Frontend (Vercel Environment Variables):**
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### Recommended Hosting Platforms

**Backend + Database:**
- **Railway**: Auto-deploy from GitHub, managed PostgreSQL, Docker support
- **Render**: Free tier available, Docker support, managed databases
- **Fly.io**: Global deployment, Docker-native, PostgreSQL extensions
- **Heroku**: Classic PaaS, PostgreSQL add-on, easy scaling

**Frontend:**
- **Vercel**: Best Next.js support, global CDN, automatic previews
- **Netlify**: Alternative with good Next.js support
- **Cloudflare Pages**: Edge deployment option

**Database (if separate):**
- **Railway PostgreSQL**: Auto-backups, connection pooling
- **Supabase**: Free tier, realtime features, built-in auth
- **AWS RDS**: Enterprise-grade, multiple regions
- **Neon**: Serverless PostgreSQL, generous free tier

### Post-Deployment Checklist

1. **Backend:**
   - Verify database connection: Check logs for Prisma connection
   - Run full data seed: `docker exec -it srag-backend pnpm run seed:prod:full`
   - Test API endpoints: Visit `https://your-backend.com/api/docs`
   - Monitor health check: `https://your-backend.com/` should return 200

2. **Frontend:**
   - Test CORS: Ensure backend allows requests from frontend domain
   - Verify API connection: Check browser console for network errors
   - Test all features: Metrics, charts, filters, grouping
   - Check responsive design: Test on mobile, tablet, desktop

3. **Security:**
   - Ensure CORS_ORIGIN is set to frontend domain (not `*`)
   - Verify backend runs as non-root user in Docker
   - Check database credentials are not exposed
   - Enable HTTPS on both frontend and backend
