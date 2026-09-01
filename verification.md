# Verification Trail

## Phase 1: Project Setup Verification

### Claim: Frontend runs on port 5173
- Status: Verified
- Ran `docker compose up --build`, confirmed frontend accessible via forwarded port 5173

### Claim: Backend runs on port 8000
- Status: Verified
- Confirmed backend accessible via forwarded port 8000

### Claim: API docs available at /docs
- Status: Verified
- Loaded `/docs` endpoint, FastAPI documentation page displayed correctly with GET endpoints listed

### Claim: No database service used
- Status:  Verified
- Confirmed via docker-compose.yml (only frontend/backend services defined) and backend/requirements.txt (no DB driver/ORM present)

### Additional finding: Root path (/) returns 404
- Status: Not part of original claim
- Base URL (e.g. https://[codespace-url]:8000/) returns `{"detail":"Not Found"}` — expected FastAPI behavior with no route at root, not necessarily an issue

### Additional finding: Unexplained port 5678
- Status: Unverified
- Port 5678 was auto-forwarded alongside 5173 and 8000, not mentioned in agent's original claims. Likely a debugger port — needs follow-up

## Phase 1: Project Summary Verification

### Claim: Product purpose - Financial dashboard
- Status: Verified
- Confirmed via README.md and dashboard-header.tsx

### Claim: No real database, uses mock data
- Status: Verified
- generate_mock_movements() in routes.py generates random data on every request, no persistence layer

### Claim: Type duplication between backend and frontend
- Status: Verified
- Backend Pydantic models (routes.py) and frontend TypeScript types (financial-types.ts) are manually kept in sync, no shared schema

### Claim: detect_outcome_alerts function has an exposed endpoint
- Status: Corrected (was initially marked unverified/unclear by agent)
- Initial agent summary said it couldn't confirm an endpoint existed
- Re-checked: endpoint DOES exist at routes.py:342-359, GET /api/metrics/alerts
- However, this endpoint is not called anywhere in the frontend (only /api/metrics is used in App.tsx)
- Conclusion: backend feature is complete but unused by the UI

### Claim: Specialized endpoints (/summary, /categories/top, /comparison, /alerts) are used by frontend
- Status: Verified - confirmed unused
- Searched entire frontend codebase for references to these endpoints - no matches found
- Only API call in frontend is fetch(`${API_BASE_URL}/api/metrics`) in App.tsx:16
- Conclusion: 4 backend endpoints (/summary, /categories/top, /comparison, /alerts) are fully implemented but not consumed by the UI - likely built for future features or left over from earlier development

## Phase 2: Conventions and Risky Patterns (Categorized)

### Architecture
- Backend: all logic in one flat routes.py file (models + business logic + endpoints together)
- No persistence layer - "database" is randomly regenerated mock data on every request (routes.py:91-99)
- Frontend/backend type duplication - FinancialMovement defined separately in Pydantic and TypeScript, no shared contract (routes.py:23-28, financial-types.ts:5-11)

### Naming
- Backend: snake_case functions/variables, PascalCase models
- Frontend: kebab-case filenames, PascalCase named-export components

### Code Duplication / DX (Developer Experience)
- Same generate -> filter -> transform pattern copy-pasted across 7 backend endpoints (routes.py:248-390)
- Frontend recalculates KPIs client-side (financial-utils.ts) duplicating logic that already exists in backend's /summary endpoint
- mock-data.ts exports mockMovements, confirmed unused anywhere in codebase (dead code)

### Error Handling / Validation
- No error handling in backend at all - no try/except, no HTTPException (routes.py)
- get_metrics_comparison has no validation that start_date <= end_date (routes.py:316-322)
- Zero-division protection inconsistent - some functions guard it, others (detect_outcome_alerts) rely on one unguarded check (routes.py:228)
- Frontend has exactly one generic error path, no retry, no per-field errors (App.tsx:18-38)

### Testing
- test_routes.py tests backend route status/JSON shape via TestClient
- financial-utils.test.ts tests only pure functions, not components

### Proposed Rules (draft, to be implemented in Phase 3)

1. "Always add try/except or HTTPException error handling to new backend endpoints in routes.py"
   - Addresses: no error handling exists in backend currently

2. "Validate that start_date <= end_date before computing date ranges in comparison/summary logic"
   - Addresses: get_metrics_comparison has no validation (routes.py:316-322)

3. "Before adding new backend logic, check if it duplicates the generate->filter->transform pattern already used in routes.py; extract shared logic instead of copy-pasting"
   - Addresses: pattern duplicated across 7 endpoints (routes.py:248-390)

4. "Do not use mock-data.ts (mockMovements) as a data source - confirmed unused dead code"
   - Addresses: dead code risk in mock-data.ts

5. "When modifying FinancialMovement fields, update both routes.py (Pydantic) and financial-types.ts (TypeScript) together"
   - Addresses: type duplication with no shared contract (routes.py:23-28, financial-types.ts:5-11)