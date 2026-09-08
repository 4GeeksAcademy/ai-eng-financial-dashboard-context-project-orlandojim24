import type { BusinessType, Category, OperationType } from '../src/lib/financial-types';

export type { BusinessType, Category, OperationType };

/**
 * Response returned by the GET /api/metrics/facets endpoint.
 * Provides metadata and available facet filter values (categories, business types,
 * operation types, and date boundaries) present across all financial movements.
 */
export interface FacetsResponse {
  /**
   * Available operation types in the dataset.
   * Valid values: 'income' | 'outcome'.
   */
  operation_types: OperationType[];

  /**
   * Available business segment types in the dataset.
   * Valid values: 'B2B' | 'B2C'.
   */
  business_types: BusinessType[];

  /**
   * Distinct financial categories present in the dataset.
   * Valid values: 'suppliers' | 'sales' | 'operational' | 'administrative' | 'others'.
   */
  categories: Category[];

  /**
   * Earliest transaction date available in the dataset.
   * Format: ISO 8601 calendar date string ('YYYY-MM-DD').
   */
  min_date: string;

  /**
   * Latest transaction date available in the dataset.
   * Format: ISO 8601 calendar date string ('YYYY-MM-DD').
   */
  max_date: string;
}

/**
 * Represents a single spending anomaly/alert entry where outcome significantly exceeded baseline.
 * Item element in the GET /api/metrics/alerts response array.
 */
export interface AlertEntry {
  /**
   * Period identifier for which the alert was detected.
   * Format depends on the `group_by` parameter:
   * - 'month': 'YYYY-MM' (e.g. '2026-03')
   * - 'week': 'YYYY-Www' (e.g. '2026-W12')
   * - 'day': 'YYYY-MM-DD' (e.g. '2026-03-15')
   */
  period: string;

  /**
   * Total outcome amount spent during this period.
   * Format: Float / monetary number (e.g., 12500.50).
   */
  outcome_total: number;

  /**
   * Historical baseline average outcome calculated from prior periods.
   * Format: Float / monetary number (e.g., 8200.00).
   */
  baseline_average: number;

  /**
   * Relative ratio by which outcome_total exceeded baseline_average.
   * Computed as `(outcome_total - baseline_average) / baseline_average`.
   * Format: Float (e.g., 0.35 represents a 35% spike).
   */
  increase_ratio: number;
}

/**
 * Response returned by the GET /api/metrics/alerts endpoint.
 * List of outcome anomaly alerts for periods exceeding the configured increase threshold.
 */
export type AlertsResponse = AlertEntry[];

/**
 * Represents an aggregated category ranking entry.
 * Item element in the GET /api/metrics/categories/top response array.
 */
export interface CategoryEntry {
  /**
   * Name of the financial category.
   * Valid values: 'suppliers' | 'sales' | 'operational' | 'administrative' | 'others'.
   */
  category: Category;

  /**
   * Operation type of the movements included in the aggregation.
   * Valid values: 'income' | 'outcome'.
   */
  operation_type: OperationType;

  /**
   * Aggregated total monetary amount for this category.
   * Format: Float / monetary number rounded to 2 decimal places.
   */
  total_amount: number;
}

/**
 * Response returned by the GET /api/metrics/categories/top endpoint.
 * List of top categories ordered by total amount descending.
 */
export type TopCategoriesResponse = CategoryEntry[];
