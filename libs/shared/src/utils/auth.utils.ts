import { UnauthorizedException } from '@nestjs/common';

/**w
 * Interface for any service that can fetch user by supabaseId
 */
export interface IUserService {
  findUserBySupabaseId(supabaseId: string): Promise<{ userId: string }>;
}

/**
 * Utility function to get userId from supabaseId in the request
 * @param req - Express request object with user attached by JWT middleware
 * @param usersService - Service instance that implements IUserService
 * @returns userId string
 * @throws UnauthorizedException if user not found
 */
export async function getUserIdFromRequest(
  req: any,
  usersService: IUserService,
): Promise<string> {
  const supabaseId = req.user?.userId; 

  if (!supabaseId) {
    throw new UnauthorizedException('User not authenticated');
  }

  try {
    const user = await usersService.findUserBySupabaseId(supabaseId);
    return user.userId;
  } catch (error) {
    throw new UnauthorizedException('User not found in database');
  }
}
