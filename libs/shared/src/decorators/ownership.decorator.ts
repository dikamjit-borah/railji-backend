import { SetMetadata } from '@nestjs/common';

export const OWNERSHIP_KEY = 'ownership';

/**
 * Decorator to require ownership check on a route
 * Ensures the authenticated user can only access their own data
 * @param paramName - The route parameter name to check against userId (default: 'userId')
 * @example
 * @RequireOwnership() // Checks params.userId
 * @RequireOwnership('accountId') // Checks params.accountId
 */
export const RequireOwnership = (paramName: string = 'userId') =>
  SetMetadata(OWNERSHIP_KEY, { required: true, param: paramName });
