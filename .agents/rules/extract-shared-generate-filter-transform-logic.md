---
title: Extract shared generate -> filter -> transform logic instead of copy-pasting
description: >
  The pattern "movements = generate_mock_movements(seed=42) -> optional
  business_type filter -> filter_movements(...) -> transform/return" is
  duplicated near-verbatim across 7 endpoints in routes.py (get_metrics,
  get_metrics_summary, get_top_categories, get_metrics_comparison,
  get_metrics_alerts, get_b2b_metrics, get_b2c_metrics — routes.py:248-390).
  get_b2b_metrics/get_b2c_metrics in particular duplicate get_metrics almost
  line-for-line with only a hardcoded business_type filter. Any change to
  generate_mock_movements or filter_movements risks being applied
  inconsistently across copies.
globs: backend/app/routes.py
applicationType: auto-attached
---

# Extract shared generate -> filter -> transform logic

## Instruction

Before adding new backend logic in `backend/app/routes.py`, check whether it
repeats the existing generate → filter → transform pattern:

1. `movements = generate_mock_movements(seed=42)`
2. optional filter by `business_type`
3. `filter_movements(movements, start_date, end_date, category, operation_type)`
4. transform/aggregate and return

If it does, extract or reuse a shared helper (e.g. a single
`get_filtered_movements(...)` function that accepts all filter parameters
including `business_type`) rather than copy-pasting the sequence into a new
endpoint function.

- Do not create new `get_*_metrics` endpoints that duplicate `get_metrics`
  with only a hardcoded filter, the way `get_b2b_metrics`/`get_b2c_metrics`
  currently do — instead, prefer extending `get_metrics` or a shared filter
  helper to accept the differentiating parameter.
- If refactoring `generate_mock_movements` or `filter_movements`, verify the
  change is reflected consistently across all 7 call sites, not just the one
  being edited.
