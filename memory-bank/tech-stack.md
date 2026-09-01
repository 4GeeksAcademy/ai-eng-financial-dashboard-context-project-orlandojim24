# Tech Stack

## Frontend
- React with TypeScript
- Vite for the dev server and build
- Vite's dev server proxies /api requests to the backend, so there's no CORS issues locally
- Files are named kebab-case (like kpi-card.tsx)
- Components use PascalCase named exports, not default exports

## Backend
- Python with FastAPI
- Pydantic models handle request/response validation
- No database - everything is generated in-memory with generate_mock_movements(), no ORM or DB driver anywhere in requirements.txt

## Infrastructure
- Docker Compose runs both frontend and backend together
- Frontend runs on port 5173
- Backend runs on port 8000, with Swagger docs auto-generated at /docs
- No env variables needed by default, but VITE_API_BASE_URL can override the backend URL if needed

## Testing
- Backend tests are in test_routes.py using FastAPI's TestClient
- Frontend tests are in financial-utils.test.ts using vitest, but only test the pure functions, not the actual components