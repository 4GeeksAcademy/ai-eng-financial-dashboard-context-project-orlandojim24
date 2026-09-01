# Tech Stack

## Frontend
- React with TypeScript
- Vite (dev server + build tool)
- Vite dev-server proxy forwards /api requests to the backend (avoids CORS issues in local/dev)
- File naming: kebab-case (e.g. kpi-card.tsx)
- Components: PascalCase named exports (not default exports)

## Backend
- Python, FastAPI
- Pydantic models for request/response validation
- No database - all data is generated in-memory via generate_mock_movements(), no ORM or DB driver present in requirements.txt

## Infrastructure
- Docker Compose runs both services together (docker-compose.yml)
- Frontend exposed on port 5173
- Backend exposed on port 8000, with auto-generated API docs at /docs (Swagger UI)
- No environment variables required by default; VITE_API_BASE_URL can optionally override the backend URL

## Testing
- Backend: test_routes.py using fastapi.testclient.TestClient
- Frontend: financial-utils.test.ts using vitest (tests pure functions only, not components)