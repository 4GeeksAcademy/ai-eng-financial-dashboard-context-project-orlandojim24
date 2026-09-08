# Frontend Component Specifications

This document defines the React component architecture and specifications for the three dashboard features utilizing the backend endpoints:
1. **Facet Filter Controls** (`/api/metrics/facets`)
2. **Outcome Anomaly Alerts** (`/api/metrics/alerts`)
3. **Top Categories & B2B vs B2C Comparison** (`/api/metrics/categories/top`)

All prop definitions reference types defined in [frontend/specs/api-types.ts](frontend/specs/api-types.ts) and [frontend/specs/param-types.ts](frontend/specs/param-types.ts).

---

## 1. Feature 1: Facet Filter Controls (`/api/metrics/facets`)

### 1.1 Overview
Provides global filter controls across the dashboard driven dynamically by dataset facets (available date range boundaries, active categories, operation types, and business segments).

### 1.2 Components

#### `DashboardFilterBar`
Container bar holding the filter dropdowns and date inputs.

- **Props**:
  ```typescript
  interface DashboardFilterBarProps {
    facets?: FacetsResponse;
    filters: {
      startDate: string | null;
      endDate: string | null;
      businessType: BusinessType | null;
      category: Category | null;
      operationType: OperationType | null;
    };
    onFilterChange: (filters: Partial<DashboardFilterBarProps['filters']>) => void;
    onReset: () => void;
    isLoading: boolean;
    error?: Error | null;
  }
  ```
- **Renders**:
  - Date range pickers (Start Date, End Date) with `min` and `max` constraints populated from `facets.min_date` and `facets.max_date`.
  - Dropdown selector for Business Segment (`'All'`, `'B2B'`, `'B2C'`) based on `facets.business_types`.
  - Dropdown selector for Category (`'All'`, `'suppliers'`, `'sales'`, `'operational'`, `'administrative'`, `'others'`) based on `facets.categories`.
  - Segmented toggle/dropdown for Operation Type (`'All'`, `'income'`, `'outcome'`) based on `facets.operation_types`.
  - Reset filters button.
- **States**:
  - **Loading**: Dropdowns and date inputs rendered as disabled skeleton placeholders.
  - **Error**: Renders a compact warning banner with a retry action while falling back to permissive default ranges.
  - **Empty / Default**: When facets arrays are empty, renders default controls disabled with an informative tooltip.

---

## 2. Feature 2: Outcome Anomaly Alerts (`/api/metrics/alerts`)

### 2.1 Overview
Monitors outcome spending and flags anomalous spending periods where outcome spikes exceed a user-configurable baseline increase threshold.

### 2.2 Components

#### `AlertsThresholdInput`
Input control allowing users to adjust the sensitivity threshold for outcome anomaly detection.

- **Props**:
  ```typescript
  interface AlertsThresholdInputProps {
    value: number; // e.g. 0.3 for 30%
    onChange: (threshold: number) => void;
    disabled?: boolean;
  }
  ```
- **Validation & Clamping Rule**:
  - The backend API enforces `threshold >= 0` (minimum 0), but does not cap the upper bound.
  - The frontend component **must validate and clamp** user input values strictly between **`0.01` (1%) and `1.0` (100%)**.
  - Any input `< 0.01` is clamped to `0.01`. Any input `> 1.0` is clamped to `1.0`.
  - Displayed as a percentage (e.g. `30%`) or decimal slider with step `0.05`.

#### `AnomalyAlertsTable`
Tabular view displaying detected spending anomaly alerts.

- **Props**:
  ```typescript
  interface AnomalyAlertsTableProps {
    alerts: AlertsResponse;
    params: AlertsParams;
    onParamsChange: (newParams: Partial<AlertsParams>) => void;
    isLoading: boolean;
    error?: Error | null;
    onRetry?: () => void;
  }
  ```
- **Column to API Field Mapping**:
  | Column Header | Underlying API Field | Type | Formatting / Display Logic |
  | :--- | :--- | :--- | :--- |
  | **Period** | `period` | `string` | Formatted based on `group_by` (e.g., `'2026-03'` $\rightarrow$ `'March 2026'`, `'2026-W12'` $\rightarrow$ `'Week 12, 2026'`, `'2026-03-15'` $\rightarrow$ `'Mar 15, 2026'`) |
  | **Recorded Outcome** | `outcome_total` | `number` | Currency format: `$12,500.50` |
  | **Baseline Average** | `baseline_average` | `number` | Currency format: `$8,200.00` |
  | **Spike / Increase** | `increase_ratio` | `number` | Percentage badge: `+35.4%` (`+(increase_ratio * 100).toFixed(1)%`), highlighted with warning/destructive badge style |

- **States**:
  - **Loading**: Renders 3–5 skeleton table rows with pulsing placeholders.
  - **Error**: Displays an error alert card with message and a "Try Again" button triggering `onRetry`.
  - **Empty**: Displays a success/empty banner: *"No outcome anomalies detected for the selected period and threshold."*

---

## 3. Feature 3: Top Categories & B2B vs B2C Comparison (`/api/metrics/categories/top`)

### 3.1 Overview
Analyzes spending and revenue distribution across categories, comparing volume and relative contribution between business models (B2B vs B2C).

### 3.2 Components

#### `TopCategoriesTable`
Displays top ranking categories by monetary amount with relative group share calculation.

- **Props**:
  ```typescript
  interface TopCategoriesTableProps {
    categories: TopCategoriesResponse;
    params: TopCategoriesParams;
    onParamsChange: (newParams: Partial<TopCategoriesParams>) => void;
    isLoading: boolean;
    error?: Error | null;
    onRetry?: () => void;
  }
  ```
- **Column to API Field Mapping**:
  | Column Header | Underlying API Field | Type | Display Logic & Frontend Computations |
  | :--- | :--- | :--- | :--- |
  | **Rank** | (Index) | `number` | `#1`, `#2`, `#3`, etc. based on array order |
  | **Category** | `category` | `Category` | Capitalized label (e.g. `'suppliers'` $\rightarrow$ `'Suppliers'`, `'operational'` $\rightarrow$ `'Operational'`) |
  | **Type** | `operation_type` | `OperationType` | Badge indicator (`'income'` in green, `'outcome'` in red/orange) |
  | **Total Amount** | `total_amount` | `number` | Currency format: `$45,230.00` |
  | **% of Group Total** | *Calculated on Frontend* | `number` | Percentage of total group spending/income with progress bar |

- **Client-Side Calculation Requirement (`% of Group Total`)**:
  - The backend endpoint `/api/metrics/categories/top` returns individual `total_amount` values per category, but **does not return the sum or percentage share**.
  - The frontend **must calculate** the group percentage for each row $i$:
    $$\text{Group Total} = \sum_{j=1}^{N} \text{total\_amount}_j$$
    $$\text{Percentage of Group Total}_i = \begin{cases} \left( \frac{\text{total\_amount}_i}{\text{Group Total}} \right) \times 100 & \text{if } \text{Group Total} > 0 \\ 0 & \text{otherwise} \end{cases}$$
  - Formatted to 1 decimal place (e.g. `34.8%`).

#### `CategoryComparisonControls`
Filter bar for configuring category comparison parameters.

- **Props**:
  ```typescript
  interface CategoryComparisonControlsProps {
    params: TopCategoriesParams;
    onChange: (updated: Partial<TopCategoriesParams>) => void;
    disabled?: boolean;
  }
  ```
- **Renders**:
  - Operation type toggle (`'Income'` vs `'Outcome'`, default: `'outcome'`).
  - Business type toggle/selector (`'All'`, `'B2B'`, `'B2C'`).
  - Limit selector dropdown (`5`, `10`, `15`, `20` items, clamped between 1 and 20).

#### `BusinessTypeComparisonView`
Container component coordinating the side-by-side comparison of B2B and B2C segments. It fetches and renders two `TopCategoriesTable` instances simultaneously (one with `business_type='B2B'` and one with `business_type='B2C'`), both fixed to show their top 5 income categories (`operation_type='income'`), along with the `IncomeComparisonChart` below them.

- **Props**:
  ```typescript
  interface BusinessTypeComparisonViewProps {
    dateRange?: DateRangeFilter;
    limit?: number;
  }
  ```
- **Renders**:
  - Side-by-side grid layout (two columns on desktop, stacked on mobile) containing:
    1. **B2B Top Categories Section**: `TopCategoriesTable` populated with data fetched using `{ business_type: 'B2B', operation_type: 'income', limit: 5, ...dateRange }`.
    2. **B2C Top Categories Section**: `TopCategoriesTable` populated with data fetched using `{ business_type: 'B2C', operation_type: 'income', limit: 5, ...dateRange }`.
  - **Income Comparison Section**: Placed below the two tables, rendering the `IncomeComparisonChart` to visually contrast total revenue between B2B and B2C.
- **States**:
  - **Loading**: Displays side-by-side table skeleton loaders and a chart skeleton container.
  - **Error**: Renders an error banner with a retry action if either query fails.
  - **Empty**: If both B2B and B2C return empty category sets, renders a unified empty state message.

#### `IncomeComparisonChart`
Bar or comparison chart component placed below the B2B and B2C tables that visually compares the aggregated total income of B2B against B2C.

- **Props**:
  ```typescript
  interface IncomeComparisonDataPoint {
    segment: BusinessType; // 'B2B' | 'B2C'
    totalIncome: number;
    sharePercent: number; // calculated as (totalIncome / (b2bIncome + b2cIncome)) * 100
  }

  interface IncomeComparisonChartProps {
    data: IncomeComparisonDataPoint[];
    isLoading: boolean;
    error?: Error | null;
    onRetry?: () => void;
  }
  ```
- **Data Shape & Calculation**:
  - `data` array containing two items:
    - B2B segment: `{ segment: 'B2B', totalIncome: sum(b2bIncomeCategories), sharePercent: ... }`
    - B2C segment: `{ segment: 'B2C', totalIncome: sum(b2cIncomeCategories), sharePercent: ... }`
  - Total income for each segment is computed by summing the `total_amount` of categories fetched with `operation_type='income'` for that segment.
- **Renders**:
  - Grouped / side-by-side bar chart (built with Recharts) comparing monetary volume for B2B vs B2C.
  - Tooltips showing currency values formatted as `$XX,XXX.XX` and relative share percentages (e.g. `62.5%`).
  - Legend and summary metrics banner displaying the leading revenue stream.
- **States**:
  - **Loading**: Renders a pulsing chart skeleton container matching the chart dimensions.
  - **Error**: Displays an error card with error message and a retry button calling `onRetry`.
  - **Empty**: When total income for both segments is zero, displays an empty chart state: *"No income data available to compare for the selected date range."*

---

## 4. Summary of State Handling Conventions

| State | Visual Representation | User Action Available |
| :--- | :--- | :--- |
| **Loading** | `Skeleton` rows and card shells matching expected layout | Inputs disabled to prevent concurrent race conditions |
| **Error** | Destructive alert box with error message | "Retry" button to re-fetch endpoint |
| **Empty** | Subtle empty state container with contextual icon and message | Guidance to adjust filters or thresholds |
