import { Module, DynamicModule } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SupabaseStrategy, SupabaseConfig } from './supabase.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { createAuthModuleProviders } from './auth.factory';

@Module({})
export class AuthModule {
  static forRoot(config: SupabaseConfig): DynamicModule {
    return {
      module: AuthModule,
      imports: [PassportModule.register({ defaultStrategy: 'supabase' })],
      providers: [
        ...createAuthModuleProviders(config),
        JwtAuthGuard,
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
      ],
      exports: [PassportModule, SupabaseStrategy, JwtAuthGuard],
    };
  }
}