import { SetMetadata } from '@nestjs/common';

export const OWNERSHIP_KEY = 'ownership';

/**
 * Decorator to require ownership check on a route
 * Ensures the authenticated user can only access their own data
 * 
 * @param field - The field name to check (e.g., 'userId', 'examId')
 * @param location - Where to find it: 'param' (URL params) or 'body' (request body)
 * 
 * @example
 * @RequireOwnership('userId', 'param') // Checks if params.userId matches authenticated user
 * @RequireOwnership('examId', 'body') // Checks if user owns the exam in body.examId
 * @RequireOwnership('examId', 'param') // Checks if user owns the exam in params.examId
 */
export const RequireOwnership = (
  field: string = 'userId',
  location: 'param' | 'body' = 'param',
) => {
  return SetMetadata(OWNERSHIP_KEY, { field, location });
};
