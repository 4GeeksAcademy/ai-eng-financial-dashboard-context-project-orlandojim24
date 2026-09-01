# Product Context

## Overview
Financial Overview is an executive metrics dashboard for visualizing income, expenses, and profitability from financial movement data. Confirmed via README.md and the UI title/subtitle in dashboard-header.tsx ("Financial Overview — Executive metrics dashboard").

## Data Model
Each financial movement has: date, amount, operation_type (income/outcome), category (suppliers, sales, operational, administrative, others), and business_type (B2B/B2C). Confirmed in backend/app/routes.py.

## Key Features (Verified)
- KPI row with 4 cards: Total Income, Total Outcome, Profit, Profit Margin (%) — kpi-row.tsx
- Two charts: IncomeOutcomeChart and ProfitPercentChart (monthly) — App.tsx
- Filtering by date range, category, operation type (backend supports this via /api/metrics)

## Important Note: No Real Data Source
This is a demo/prototype product. There is no database or persistence layer. All data is randomly regenerated on every request via generate_mock_movements(seed=42) in routes.py. This is a significant fact for anyone building on this project — nothing here is real financial data, and nothing is saved between requests.

## Backend Endpoints Not Used by Frontend
4 backend endpoints exist but are confirmed unused by the UI: /api/metrics/summary, /api/metrics/categories/top, /api/metrics/comparison, /api/metrics/alerts. The frontend only calls /api/metrics and does its own calculations client-side. These endpoints may be intended for future features.