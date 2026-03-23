export { AuthModule } from './auth.module';
export { JwtAuthGuard } from './jwt-auth.guard';
export { SupabaseStrategy, JwtPayload, SupabaseConfig } from './supabase.strategy';
export { CurrentUser, CurrentUserData } from './decorators/current-user.decorator';
export { Public, IS_PUBLIC_KEY } from './decorators/public.decorator';
export { createSupabaseStrategyProvider, createAuthModuleProviders } from './auth.factory';