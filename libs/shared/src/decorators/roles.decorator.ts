import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route
 * @param roles - Array of role names (e.g., 'superadmin', 'admin', 'user')
 * @example
 * @Roles('superadmin')
 * @Roles('admin', 'superadmin')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
