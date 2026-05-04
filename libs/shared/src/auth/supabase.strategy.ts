import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

export interface JwtPayload {
  sub: string;
  email: string;
  role?: string;
  aud: string;
  exp: number;
  iat: number;
}

export interface SupabaseConfig {
  url: string;
  jwtAudience: string;
}

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  private readonly logger = new Logger(SupabaseStrategy.name);

  constructor(private readonly supabaseConfig: SupabaseConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${supabaseConfig.url}/auth/v1/.well-known/jwks.json`,
      }),
      audience: supabaseConfig.jwtAudience,
      issuer: `${supabaseConfig.url}/auth/v1`,
      algorithms: ['RS256', 'ES256'],
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.email) {
      this.logger.warn('Invalid token payload: missing sub or email');
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role || 'user',
    };
  }
}