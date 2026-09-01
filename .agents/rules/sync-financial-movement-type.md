---
title: Keep FinancialMovement in sync across backend and frontend
description: >
  The FinancialMovement shape is defined independently in two places with no
  shared schema or codegen contract — the Pydantic model in
  backend/app/routes.py:23-28 and the TypeScript interface in
  frontend/src/lib/financial-types.ts:5-11. Nothing enforces they match, so a
  field/enum change on one side silently breaks the other at runtime instead
  of at build/compile time.
globs: backend/app/routes.py,frontend/src/lib/financial-types.ts
applicationType: auto-attached
---

# Keep FinancialMovement in sync across backend and frontend

## Instruction

When changing any field, type, or enum literal on `FinancialMovement` (or its
related types `OperationType`, `Category`, `BusinessType`) in
`backend/app/routes.py`, make the equivalent change in
`frontend/src/lib/financial-types.ts` in the same commit/change — and vice
versa.

- Treat these two definitions as one logical contract even though there is
  no shared schema/codegen between them.
- When adding/removing/renaming a `Category` or `BusinessType` literal value,
  update both the backend `Literal[...]` and the frontend union type, plus
  any place that lists all values (e.g. `OUTCOME_CATEGORIES` in routes.py).
- Call out in the PR/change description that both sides were updated
  together, since there is no automated check that would catch a mismatch.
