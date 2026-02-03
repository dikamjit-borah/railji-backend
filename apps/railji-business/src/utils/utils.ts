/**
 * Generic utility functions for the application
 */

// ==================== ARRAY UTILITIES ====================

/**
 * Filters out null, undefined, and empty string values from an array
 * @param array - Array to filter
 * @returns Cleaned array without null/undefined/empty values
 */
export function filterNullValues<T>(array: (T | null | undefined)[]): T[] {
  return array.filter((item): item is T => 
    item != null && (typeof item !== 'string' || item.trim() !== '')
  );
}

/**
 * Ensures an array is never null/undefined and filters out null values
 * @param array - Array that might be null/undefined
 * @returns Clean array without null values
 */
export function ensureCleanArray<T>(array?: (T | null | undefined)[] | null): T[] {
  if (!Array.isArray(array)) {
    return [];
  }
  return filterNullValues(array);
}

/**
 * Creates a clean object with arrays that contain no null values
 * @param obj - Object with array properties
 * @returns Object with cleaned arrays
 */
export function cleanObjectArrays<T extends Record<string, any>>(obj: T): T {
  const cleaned = { ...obj };
  
  for (const key in cleaned) {
    if (Array.isArray(cleaned[key])) {
      (cleaned as any)[key] = ensureCleanArray(cleaned[key]);
    }
  }
  
  return cleaned;
}

/**
 * Safely adds items to an array, filtering out null values
 * @param targetArray - Array to add items to
 * @param items - Items to add
 */
export function safeArrayPush<T>(
  targetArray: T[], 
  items: (T | null | undefined)[]
): void {
  const cleanItems = filterNullValues(items);
  targetArray.push(...cleanItems);
}

// ==================== STRING UTILITIES ====================

/**
 * Checks if a string is null, undefined, or empty
 * @param str - String to check
 * @returns True if string is null/undefined/empty
 */
export function isEmptyString(str?: string | null): boolean {
  return !str || str.trim() === '';
}

/**
 * Safely trims a string, returns empty string if null/undefined
 * @param str - String to trim
 * @returns Trimmed string or empty string
 */
export function safeTrim(str?: string | null): string {
  return str?.trim() || '';
}

// ==================== OBJECT UTILITIES ====================

/**
 * Removes null and undefined values from an object
 * @param obj - Object to clean
 * @returns Object without null/undefined values
 */
export function removeNullValues<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Partial<T> = {};
  
  for (const key in obj) {
    if (obj[key] != null) {
      cleaned[key] = obj[key];
    }
  }
  
  return cleaned;
}

/**
 * Deep clones an object
 * @param obj - Object to clone
 * @returns Deep cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

// ==================== VALIDATION UTILITIES ====================

/**
 * Checks if a value is defined (not null or undefined)
 * @param value - Value to check
 * @returns True if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value != null;
}

/**
 * Checks if a value is a valid number
 * @param value - Value to check
 * @returns True if value is a valid number
 */
export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

// ==================== DATE UTILITIES ====================

/**
 * Formats a date to ISO string safely
 * @param date - Date to format
 * @returns ISO string or null if invalid date
 */
export function safeISOString(date?: Date | string | null): string | null {
  if (!date) return null;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString();
  } catch {
    return null;
  }
}