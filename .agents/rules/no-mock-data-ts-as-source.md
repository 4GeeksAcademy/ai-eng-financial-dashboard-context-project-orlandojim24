---
title: Do not use mock-data.ts as a data source
description: >
  frontend/src/lib/mock-data.ts exports mockMovements, a hardcoded array of
  FinancialMovement records. A repo-wide search confirms it is not imported
  or referenced anywhere else in the codebase — it is dead code, not the
  active data source. The dashboard's real data source is the backend
  /api/metrics endpoint (see frontend/src/App.tsx).
globs: frontend/src/**
applicationType: auto-attached
---

# Do not use mock-data.ts as a data source

## Instruction

- Do not import or wire up `mockMovements` from `frontend/src/lib/mock-data.ts`
  into components, hooks, or the app entry point as a live data source. It is
  unused fixture/dead code, confirmed by a full-codebase search finding zero
  references outside its own file.
- The dashboard's actual data source is the backend, fetched via
  `fetch(\`${API_BASE_URL}/api/metrics\`)` in `frontend/src/App.tsx` — new
  data-fetching code should follow that pattern, not `mock-data.ts`.
- If `mock-data.ts` is genuinely needed going forward (e.g. for Storybook or
  new tests), say so explicitly in the change and update this rule/file
  rather than silently reviving it as a runtime data source.
