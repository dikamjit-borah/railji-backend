/**
 * Pagination utilities for consistent pagination across the application
 */

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Calculates the skip value for database queries
 * @param page - Current page number (1-based)
 * @param limit - Items per page
 * @returns Number of items to skip
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Creates pagination metadata with all required datapoints
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Pagination metadata
 */
export function pagination(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
  };
}

/**
 * Validates and normalizes pagination parameters
 * @param page - Page number (can be string or number)
 * @param limit - Limit per page (can be string or number)
 * @param maxLimit - Maximum allowed limit (default: 100)
 * @returns Normalized pagination options
 */
export function paginate(
  page: string | number = 1,
  limit: string | number = 10,
  maxLimit: number = 100,
): PaginationOptions {
  const normalizedPage = Math.max(1, parseInt(String(page), 10) || 1);
  const normalizedLimit = Math.min(
    maxLimit,
    Math.max(1, parseInt(String(limit), 10) || 10),
  );

  return {
    page: normalizedPage,
    limit: normalizedLimit,
  };
}