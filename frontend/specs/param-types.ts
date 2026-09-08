import type { BusinessType, OperationType } from '../src/lib/financial-types';

export type { BusinessType, OperationType };

/**
 * Supported grouping intervals for metrics aggregation and anomaly detection.
 * Valid values: 'day' | 'week' | 'month'.
 */
export type GroupBy = 'day' | 'week' | 'month';

/**
 * Common date range filter parameters applicable across financial metric endpoints.
 */
export interface DateRangeFilter {
  /**
   * Start date boundary (inclusive) for filtering movements.
   * Format: ISO 8601 calendar date string ('YYYY-MM-DD').
   * @example '2026-01-01'
   */
  start_date?: string | null;

  /**
   * End date boundary (inclusive) for filtering movements.
   * Format: ISO 8601 calendar date string ('YYYY-MM-DD').
   * @example '2026-12-31'
   */
  end_date?: string | null;
}

/**
 * Query parameters for the GET /api/metrics/alerts endpoint.
 * Detects spending anomalies where outcome totals exceed historical baseline averages.
 */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Relative threshold ratio for triggering an anomaly alert.
   * Outcome increases greater than `(outcome - baseline) / baseline > threshold` will generate alerts.
   * Constraints: Minimum value is 0 (ge: 0).
   * @default 0.3 (representing a 30% increase above baseline)
   */
  threshold?: number;

  /**
   * Time bucket granularity for aggregating outcomes before calculating historical baselines.
   * Valid values: 'day' | 'week' | 'month'.
   * @default 'month'
   */
  group_by?: GroupBy;

  /**
   * Optional business model filter to isolate B2B or B2C movements.
   * Valid values: 'B2B' | 'B2C' | null.
   * @default undefined (includes all business types)
   */
  business_type?: BusinessType | null;
}

/**
 * Query parameters for the GET /api/metrics/categories/top endpoint.
 * Retrieves top ranking spending or revenue categories by aggregated total amount.
 */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Filter categories by movement operation direction.
   * Valid values: 'income' | 'outcome'.
   * @default 'outcome'
   */
  operation_type?: OperationType;

  /**
   * Maximum number of top categories to return.
   * Constraints: Integer between 1 and 20 (ge: 1, le: 20).
   * @default 5
   */
  limit?: number;

  /**
   * Optional business model filter to isolate B2B or B2C movements.
   * Valid values: 'B2B' | 'B2C' | null.
   * @default undefined (includes all business types)
   */
  business_type?: BusinessType | null;
}
