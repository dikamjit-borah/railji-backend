import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IUserService } from '../utils/auth.utils';

export const ROLES_KEY = 'roles';
export const OWNERSHIP_KEY = 'ownership';

export interface RoleConfig {
  roles?: string[];
  requireOwnership?: boolean;
  ownershipParam?: string; // The param name to check (default: 'userId')
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: IUserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get role configuration from decorator
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const ownershipConfig = this.reflector.getAllAndOverride<{
      required: boolean;
      param: string;
    }>(OWNERSHIP_KEY, [context.getHandler(), context.getClass()]);

    // If no roles or ownership required, allow access
    if (!roles && !ownershipConfig) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const supabaseId = request.user?.userId; 

    if (!supabaseId) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      // Fetch user from database
      const user = await this.usersService.findUserBySupabaseId(supabaseId);

      if (!user) {
        throw new UnauthorizedException('User not found in database');
      }

      // Check role-based access
      if (roles && roles.length > 0) {
        const userRole = (user as any).userType || (user as any).role;
        
        if (!userRole || !roles.includes(userRole)) {
          throw new ForbiddenException(
            `Access denied. Required role: ${roles.join(' or ')}`,
          );
        }
      }

      // Check ownership
      if (ownershipConfig?.required) {
        const paramName = ownershipConfig.param || 'userId';
        const requestedUserId = request.params[paramName];

        if (requestedUserId && user.userId !== requestedUserId) {
          throw new ForbiddenException('You can only access your own data');
        }
      }

      // Attach full user to request for use in controllers
      request.dbUser = user;

      return true;
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Authorization failed');
    }
  }
}
