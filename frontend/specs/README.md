# Frontend Feature Specifications & API Integration Guide

This directory contains the design specifications and TypeScript definitions for the three new financial dashboard features:
1. **Facet-Driven Date Range & Segment Filters**
2. **Outcome Anomaly Alerts**
3. **B2B vs B2C Category & Income Comparison**

---

## 1. Feature 1: Date Range & Facet Filters

### 1.1 Endpoints Consumed
- **Primary Endpoint**: `GET /api/metrics/facets` (verified against `/docs`)
- **Filtered Consumption**: `GET /api/metrics`, `GET /api/metrics/alerts`, `GET /api/metrics/categories/top`

### 1.2 TypeScript Types
- **Response**: `FacetsResponse` from [frontend/specs/api-types.ts](frontend/specs/api-types.ts)
- **Request / Query**: `DateRangeFilter` from [frontend/specs/param-types.ts](frontend/specs/param-types.ts)

### 1.3 Parameter Constraints & Valid Values
- `start_date`: ISO 8601 calendar string (`YYYY-MM-DD`). Must be $\le$ `end_date` and $\ge$ `facets.min_date`.
- `end_date`: ISO 8601 calendar string (`YYYY-MM-DD`). Must be $\ge$ `start_date` and $\le$ `facets.max_date`.
- `business_type`: `'B2B' | 'B2C' | null`
- `category`: `'suppliers' | 'sales' | 'operational' | 'administrative' | 'others' | null`
- `operation_type`: `'income' | 'outcome' | null`

### 1.4 Edge Cases & UI Behavior

#### Edge Case 1: Inverted Date Range (`start_date` > `end_date`)
- **Condition**: User manually inputs or selects a `start_date` that is after the `end_date` (e.g. `2026-08-01` to `2026-03-01`).
- **UI Behavior**:
  - The UI must block the API dispatch and display an inline validation warning below the date inputs: *"Start date must be before or equal to end date."*
  - Automatically clamp or snap `end_date` to equal `start_date` upon selection.

#### Edge Case 2: Facets Endpoint Fails to Load / Network Error
- **Condition**: `GET /api/metrics/facets` returns a `500 Internal Server Error` or network timeout.
- **UI Behavior**:
  - Render the filter bar in a degraded state with a non-blocking warning banner: *"Unable to load dynamic date boundaries."*
  - Enable date pickers with fallback permissive boundaries (e.g. past 2 years up to today) and show a "Retry" button to reload facets.

#### Edge Case 3: Single-Date Input (Open-Ended Ranges)
- **Condition**: User provides only one boundary (`start_date` specified while `end_date` is empty, or `end_date` specified while `start_date` is empty).
- **UI Behavior**:
  - **Only `start_date` provided**: The dashboard queries and displays all data from `start_date` onward through the latest available date (`facets.max_date`). The End Date input displays a placeholder showing the open boundary (e.g., *"Through latest"*).
  - **Only `end_date` provided**: The dashboard queries and displays all data from the earliest available date (`facets.min_date`) through `end_date`. The Start Date input displays a placeholder showing the open boundary (e.g., *"From earliest"*).
  - The active filter indicator reflects the half-open interval (e.g., *"Since 2026-03-01"* or *"Up to 2026-08-31"*).

---

## 2. Feature 2: Outcome Anomaly Alerts

### 2.1 Endpoints Consumed
- **Endpoint**: `GET /api/metrics/alerts` (verified against `/docs`)

### 2.2 TypeScript Types
- **Response**: `AlertsResponse` (`AlertEntry[]`) from [frontend/specs/api-types.ts](frontend/specs/api-types.ts)
- **Request / Query**: `AlertsParams` from [frontend/specs/param-types.ts](frontend/specs/param-types.ts)

### 2.3 Parameter Constraints & Valid Values
- `threshold`: Float number representing relative spike ratio. API enforces `ge: 0` (default `0.3`). **Frontend strictly clamps between `0.01` (1%) and `1.0` (100%)**.
- `group_by`: `'day' | 'week' | 'month'` (default `'month'`).
- `start_date`: Optional ISO date string (`YYYY-MM-DD`).
- `end_date`: Optional ISO date string (`YYYY-MM-DD`).
- `business_type`: Optional `'B2B' | 'B2C' | null`.

### 2.4 Edge Cases & UI Behavior

#### Edge Case 1: Sensitivity Threshold Out of Allowed Bounds
- **Condition**: User inputs a threshold value outside the permitted range (e.g. `0.00`, `-0.5`, `2.5`, or non-numeric input).
- **UI Behavior**:
  - On blur / change, the input value is immediately sanitized and clamped: values $< 0.01$ are set to `0.01` (1%), and values $> 1.0$ are clamped to `1.0` (100%).
  - An informational tooltip informs the user: *"Threshold must be between 1% and 100%"*.

#### Edge Case 2: No Anomalies Detected (Empty Response `[]`)
- **Condition**: The endpoint returns an empty array `[]` (spending remained within normal baselines or threshold was set high).
- **UI Behavior**:
  - Rather than displaying an empty or broken table, render a success state banner with a green checkmark/shield icon: *"No spending anomalies detected for the selected period and threshold."*
  - Provide a quick action hint: *"Try lowering the sensitivity threshold if you wish to inspect smaller variations."*

---

## 3. Feature 3: B2B vs B2C Category & Income Comparison

### 3.1 Endpoints Consumed
- **Endpoint**: `GET /api/metrics/categories/top` (verified against `/docs`)

### 3.2 TypeScript Types
- **Response**: `TopCategoriesResponse` (`CategoryEntry[]`) from [frontend/specs/api-types.ts](frontend/specs/api-types.ts)
- **Request / Query**: `TopCategoriesParams` from [frontend/specs/param-types.ts](frontend/specs/param-types.ts)

### 3.3 Parameter Constraints & Valid Values
- `operation_type`: Fixed to `'income'` for the comparison view.
- `business_type`: Required per call (`'B2B'` for the left table, `'B2C'` for the right table).
- `limit`: Integer between `1` and `20` (default and fixed to `5` for the comparison view).
- `start_date`: Optional ISO date string (`YYYY-MM-DD`).
- `end_date`: Optional ISO date string (`YYYY-MM-DD`).

### 3.4 Edge Cases & UI Behavior

#### Edge Case 1: Zero Total Group Income (Division by Zero Prevention)
- **Condition**: For a filtered date range, all returned categories have `total_amount: 0`, or the response is empty, yielding a sum of `0.00`.
- **UI Behavior**:
  - The frontend percentage calculation formula safeguards against `0 / 0` ($\text{NaN}$):
    $$\text{Percentage of Group Total} = \begin{cases} \left( \frac{\text{total\_amount}}{\text{sum}} \right) \times 100 & \text{if } \text{sum} > 0 \\ 0.0\% & \text{otherwise} \end{cases}$$
  - The column renders `0.0%` with an empty progress bar, and the chart below shows an empty state: *"No income recorded for this segment."*

#### Edge Case 2: One Segment Fails or Returns Empty While the Other Has Data
- **Condition**: B2B returns valid category entries, but B2C returns `[]` or encounters an HTTP error.
- **UI Behavior**:
  - The side-by-side view isolates component states: the B2B table renders normal data, while the B2C table displays an individual empty/error placeholder with a localized "Retry" button.
  - The `IncomeComparisonChart` renders B2B at `100.0%` share with an informational tag indicating B2C data is currently unavailable.

---

## 4. Referenced Files

- [frontend/specs/api-types.ts](frontend/specs/api-types.ts) — TypeScript response interfaces
- [frontend/specs/param-types.ts](frontend/specs/param-types.ts) — TypeScript query parameter interfaces
- [frontend/specs/components.md](frontend/specs/components.md) — React component architecture and rendering specifications
