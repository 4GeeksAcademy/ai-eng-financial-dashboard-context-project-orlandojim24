# Product Context

## Overview
This is a financial dashboard app that shows income, expenses, and profit based on transaction data. Confirmed this in README.md and the app's title in dashboard-header.tsx ("Financial Overview — Executive metrics dashboard").

## Data Model
Each transaction (movement) has: a date, an amount, if it's income or outcome, a category (suppliers, sales, operational, administrative, others), and if it's B2B or B2C. Confirmed this in backend/app/routes.py.

## Key Features (Verified)
- A row of 4 KPI cards: Total Income, Total Outcome, Profit, and Profit Margin % — kpi-row.tsx
- Two charts showing monthly income/outcome and profit percent — App.tsx
- You can filter by date range, category, and operation type through the backend's /api/metrics endpoint

## Important Note: No Real Data Source
This is just a demo/prototype, not a real product with real data. There's no database at all — every time you make a request, the data gets randomly generated again via generate_mock_movements(seed=42) in routes.py. So nothing here is actual financial data, and nothing gets saved between requests.

## Backend Endpoints Not Used by Frontend
There are 4 backend endpoints that exist but the frontend never actually calls them: /api/metrics/summary, /api/metrics/categories/top, /api/metrics/comparison, /api/metrics/alerts. The frontend only uses /api/metrics and calculates everything else on its own. These other endpoints might be there for future features that haven't been built into the UI yet.