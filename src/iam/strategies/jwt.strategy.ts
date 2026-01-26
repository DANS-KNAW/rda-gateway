import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { ConfigType } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import iamConfig from '../../config/iam.config';

export interface JwtPayload {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  identity_provider_identity?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string | string[];
}

export interface AuthenticatedUser {
  sub: string;
  email?: string;
  name?: string;
  preferredUsername?: string;
  orcid?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(iamConfig.KEY)
    config: ConfigType<typeof iamConfig>,
  ) {
    const keycloakUrl = config.KEYCLOAK_AUTH_URL;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${keycloakUrl}/protocol/openid-connect/certs`,
      }),
      issuer: keycloakUrl,
      algorithms: ['RS256'],
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      preferredUsername: payload.preferred_username,
      orcid: payload.identity_provider_identity,
    };
  }
}
