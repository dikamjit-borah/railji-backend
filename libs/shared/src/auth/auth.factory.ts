import { Provider } from '@nestjs/common';
import { SupabaseStrategy, SupabaseConfig } from './supabase.strategy';

export const createSupabaseStrategyProvider = (config: SupabaseConfig): Provider => ({
  provide: SupabaseStrategy,
  useFactory: () => new SupabaseStrategy(config),
});

export const createAuthModuleProviders = (config: SupabaseConfig): Provider[] => [
  createSupabaseStrategyProvider(config),
];