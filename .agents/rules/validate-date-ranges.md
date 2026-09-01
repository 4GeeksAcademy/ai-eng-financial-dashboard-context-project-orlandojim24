---
title: Validate start_date <= end_date in date-range logic
description: >
  get_metrics_comparison (backend/app/routes.py:305-340) computes
  previous_start = previous_end - duration without ever checking that
  start_date <= end_date. A reversed range produces a negative duration and a
  nonsensical "previous period" comparison with no error raised. Any endpoint
  or function that accepts a date range must validate the order first.
globs: backend/app/routes.py
applicationType: auto-attached
---

# Validate date ranges before use

## Instruction

Any function or endpoint in `backend/app/routes.py` that accepts a
`start_date` and `end_date` pair (e.g. `get_metrics_comparison`,
`get_metrics`, `get_metrics_summary`, `get_top_categories`, `get_metrics_alerts`)
must validate `start_date <= end_date` before doing any date arithmetic or
filtering.

- If both dates are provided and `start_date > end_date`, raise
  `HTTPException(status_code=400, detail="start_date must be before end_date")`.
- Do this validation at the top of the endpoint, before calling
  `filter_movements`, `filter_movements_by_date`, or computing derived ranges
  like `previous_start`/`previous_end`.
- Apply the same check when adding new endpoints that accept a date range —
  don't assume the pattern is already safe just because it works for
  well-formed input in tests.
