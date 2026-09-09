---
name: pre-merge-check
description: Run the repository's frontend build, dashboard Playwright smoke test, and quick accessibility sanity checks when asked for a pre-merge check, when the changes are ready to open a PR, or before I submit a pull request.
---

# Pre-Merge Check

## Purpose

Use this skill before opening a pull request for changes that affect the frontend dashboard. It verifies that the frontend still builds, the live dashboard renders with populated KPI data, and the main page remains accessible to keyboard and assistive-technology users.

Run the checks from the repository root unless a command explicitly changes directory.

## Step-by-Step Instructions

### 1. Check the frontend build

Run the frontend's documented build command:

```bash
cd frontend && npm run build
```

This runs `tsc -b` followed by `vite build`, as defined in `frontend/package.json`. Treat TypeScript errors, Vite build errors, and unexpected warnings as blockers to investigate before opening the PR.

### 2. Run the dashboard smoke test

The dashboard smoke test uses the native Python Playwright script at `frontend/e2e/dashboard_smoke.py`. From the repository root, start the backend and frontend through the repository's webapp-testing helper:

```bash
python .agents/skills/webapp-testing/scripts/with_server.py \
  --server "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000" \
  --port 8000 \
  --server "cd frontend && npm run dev -- --host 0.0.0.0" \
  --port 5173 \
  -- python frontend/e2e/dashboard_smoke.py
```

The helper manages both server lifecycles. The smoke test waits for `networkidle`, verifies the `Financial Overview` page heading, checks all four KPI labels, and confirms their rendered values contain numeric data. Do not inspect or assert against the DOM before the network-idle wait.

If Playwright is not installed in the environment, install the test dependency and Chromium before retrying:

```bash
python -m pip install playwright
python -m playwright install chromium
```

### 3. Perform a quick accessibility sanity check

Use the running dashboard from step 2 and check the rendered page before stopping the servers:

- Confirm the page has the `Financial Overview` heading and labeled `Key performance indicators` and `Financial charts` regions.
- Tab through the page and verify focus moves in a logical order without a keyboard trap or hidden focus indicator.
- Confirm the charts have accessible names from their visible titles and decorative icons are hidden from assistive technology.
- Confirm there are no content images without meaningful `alt` text. Decorative images must use an empty `alt` value.
- Check that normal text, chart labels, borders, and focus indicators remain distinguishable against their backgrounds.
- Check the page at a narrow viewport and at 200% zoom for clipped or overlapping content.

When Lighthouse is available, supplement the manual check with the accessibility audit described by the repository accessibility skill:

```bash
npx lighthouse http://localhost:5173 --only-categories=accessibility
```

A Lighthouse result is evidence, not a substitute for the manual keyboard and rendered accessibility checks.

### 4. Record the result

Only open the PR after the build and smoke test pass, and after documenting any accessibility findings or accepted follow-up work. Include the commands run and their outcomes in the PR description or internal check record.

## Example

From the repository root:

```bash
cd frontend && npm run build

python .agents/skills/webapp-testing/scripts/with_server.py \
  --server "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000" \
  --port 8000 \
  --server "cd frontend && npm run dev -- --host 0.0.0.0" \
  --port 5173 \
  -- python frontend/e2e/dashboard_smoke.py

npx lighthouse http://localhost:5173 --only-categories=accessibility
```

Then manually tab through the rendered dashboard, inspect the heading and landmark names, and record the accessibility result.

## Output Format

Report the check in this format:

```text
Pre-merge check: PASS | BLOCKED

Build: PASS | FAIL
Command: cd frontend && npm run build
Result: <short result, including relevant warnings>

Dashboard smoke test: PASS | FAIL
Command: <with_server.py command>
Result: <server readiness and test result>

Accessibility sanity check: PASS | FINDINGS | BLOCKED
Checks: <keyboard/focus, landmarks/names, text alternatives, contrast, responsive layout>
Lighthouse: PASS | FAIL | NOT RUN
Findings: <none or concise file/line references and follow-up>

Ready for PR: YES | NO
```
