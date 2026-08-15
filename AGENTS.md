# AI Skills Dashboard — Agent Instructions

## Project Overview

Full-stack AI skills analytics platform tracking demand for AI/ML engineering skills using HH.ru API and global job sources. Deployed at ai-skills.syntog.ru on SSH server "stroy".

**Owner:** Сергей Борисович Богорад (sbb@bsosh3.org)  
**Purpose:** Portfolio project demonstrating full-stack, data engineering, and ML capabilities

## Stack

**Backend:** Python 3.12, FastAPI, PostgreSQL 16 + TimescaleDB, Redis, Celery, SQLAlchemy 2.0, Pydantic v2  
**Frontend:** React 19, TypeScript, Recharts, Mapbox GL, TanStack Query v5, Tailwind CSS  
**Infrastructure:** Docker, Nginx, GitHub Actions CI/CD

## Code Standards

### Python (Backend)

- Follow Clean Code nano principles: preserve behavior, write for local reasoning, use precise names
- Use functional style over classes where possible
- Async/await for all I/O operations
- Type hints mandatory for all function signatures
- Pydantic v2 models for validation
- SQLAlchemy 2.0 async patterns
- FastAPI: def for sync, async def for async routes
- Error handling: HTTPException for expected errors, middleware for unexpected
- File naming: lowercase_with_underscores (e.g., `user_routes.py`)
- Module structure: router → services → repository → models

### TypeScript (Frontend)

- React 19 functional components only
- Custom hooks for reusable logic
- TanStack Query v5 for server state
- Strict TypeScript with no `any`
- Props interfaces for all components
- CSS: Tailwind utility classes, custom properties for tokens
- Layout: CSS Grid for page structure, Flexbox for components
- Geometry: fully rounded (999px pills, 50% circles), radii in tokens
- File naming: PascalCase for components, camelCase for utilities

### Design System

Apply design sense when creating UI components:

**Palette:** Stepped tonal surfaces from near-black (#05070C → #1E2636), cyan accent (#38BDF8) for data/tech domain  
**Typography:** Fluid clamp() scale, negative tracking on headings, custom properties for font families  
**Layout:** Grid-first architecture, fully rounded geometry (999px, 50%), tokenized spacing/radius/shadows  
**Components:** Tokenize before styling, consistent rhythm via custom properties

## Testing

- Backend: pytest with async support, 80%+ coverage
- Frontend: Vitest + React Testing Library
- E2E: Playwright for critical flows
- Run tests before every commit

## Git Workflow

- Branch naming: `feature/`, `fix/`, `refactor/`
- Commits: Conventional Commits (feat:, fix:, refactor:, docs:)
- Always run tests + linting before commit
- PR template: Summary, Testing, Screenshots (for UI)

## Pre-commit Hooks

```bash
# Lint Python with ruff
ruff check backend/

# Format Python with black
black backend/

# Type check with mypy
mypy backend/

# Lint TypeScript
npm run lint --prefix frontend

# Format with Prettier
npm run format --prefix frontend

# Run tests
pytest backend/tests/
npm test --prefix frontend
```

## Commands

### Development

```bash
# Backend
cd backend && uvicorn app.main:app --reload

# Frontend
cd frontend && npm run dev

# Celery worker
cd backend && celery -A app.celery_worker worker --loglevel=info

# Database migrations
cd backend && alembic revision --autogenerate -m "description"
cd backend && alembic upgrade head
```

### Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Rebuild
docker-compose build --no-cache

# Clean
docker-compose down -v
```

### Deployment

```bash
# Deploy to SSH server stroy
./deploy/deploy.sh production

# Check deployment
ssh stroy "docker ps | grep ai-skills"
```

## API Structure

```
/api/v1/
  /vacancies        - CRUD for job postings
  /skills           - Skills analytics
  /trends           - Time-series data
  /map              - Geographic data
  /websocket        - Real-time updates
```

## Database Schema

- `vacancies` — job postings with full text and metadata
- `skills` — normalized skill names with aliases
- `vacancy_skills` — many-to-many relationship
- `skill_trends` — time-series hypertable (TimescaleDB)
- `salary_data` — compensation analytics

## Environment Variables

Required:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `HH_API_KEY` — HeadHunter API key
- `SECRET_KEY` — JWT secret

Optional:
- `LINKEDIN_COOKIES` — LinkedIn session cookies
- `SENTRY_DSN` — Error tracking
- `MAPBOX_TOKEN` — Map visualization

## Celery Tasks

- `scrape_hh_vacancies` — Fetch new vacancies every 15 minutes
- `analyze_skill_trends` — Update time-series data hourly
- `generate_ml_predictions` — Run ML models daily
- `cleanup_old_data` — Archive data older than 2 years weekly

## Compliance (2026 Standards)

- Cookie consent banner with granular controls
- GDPR-compliant data handling
- Privacy policy and terms linked in footer
- Owner contact information visible
- Analytics opt-out functionality

## Don't Do

- Don't commit secrets or API keys
- Don't write unit tests that hit external APIs
- Don't use `any` in TypeScript
- Don't create classes when functions suffice
- Don't skip migrations for schema changes
- Don't deploy without running the test suite
- Don't add dependencies without justification

## Resources

- FastAPI docs: https://fastapi.tiangolo.com
- React 19 docs: https://react.dev
- TanStack Query: https://tanstack.com/query
- TimescaleDB docs: https://docs.timescale.com
- Tailwind CSS: https://tailwindcss.com
