---
title: Add error handling to backend endpoints
description: >
  routes.py currently has zero try/except blocks or HTTPException usage across
  all endpoints — errors rely entirely on FastAPI/Pydantic's automatic
  validation. New or modified endpoints must not repeat this gap, since an
  unguarded runtime failure (e.g. bad query combination, division by zero,
  empty dataset) would surface as an unhandled 500 with no useful message.
globs: backend/app/routes.py
applicationType: auto-attached
---

# Add error handling to backend endpoints

## Instruction

When adding or modifying an endpoint in `backend/app/routes.py`:

- Wrap logic that can fail (date math, division, empty-list access, lookups)
  in `try/except` and raise a `fastapi.HTTPException` with an appropriate
  status code (`400` for bad input, `404` for missing data) instead of
  letting an unhandled exception propagate.
- Never silently swallow an exception — either handle it meaningfully or
  re-raise as an `HTTPException` with a clear `detail` message.
- Do not assume Pydantic/FastAPI query-param typing is sufficient validation
  for business rules (e.g. relationships between two date params); those
  still need explicit checks (see the companion rule on date range
  validation).
