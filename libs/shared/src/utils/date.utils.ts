/**
 * Date utility functions for common date operations
 */

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Builds a date range filter for MongoDB queries
 * Defaults to current month if no dates are provided
 * @param startDate - Optional start date string
 * @param endDate - Optional end date string
 * @param dateField - Optional field name to filter on (default: 'createdAt')
 * @returns MongoDB filter object with date range
 */
export function buildDateFilter(
  startDate?: string,
  endDate?: string,
  dateField: string = 'createdAt',
): Record<string, { $gte: Date; $lte: Date }> {
  const now = new Date();
  const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultEndDate = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const gte = startDate ? new Date(startDate) : defaultStartDate;
  const lte = endDate ? new Date(endDate) : defaultEndDate;

  // Set end date to end of day if time is not specified
  if (endDate && lte.getHours() === 0 && lte.getMinutes() === 0) {
    lte.setHours(23, 59, 59, 999);
  }

  return {
    [dateField]: {
      $gte: gte,
      $lte: lte,
    },
  };
}

/**
 * Gets date range for current month
 * @returns DateRange object with start and end of current month
 */
export function getCurrentMonthRange(): DateRange {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  return { startDate, endDate };
}

/**
 * Gets date range for last N months
 * @param months - Number of months to go back
 * @returns DateRange object
 */
export function getLastMonthsRange(months: number): DateRange {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
}
