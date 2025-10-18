import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '../types/jwtPayload';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          if (!req || !req.cookies) return null;
          return req.cookies['refreshToken'];
        },
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'JWT_REFRESH_SECRET',
      passReqToCallback: true,
    });
  }

  validate(_req: Request, payload: JwtPayload) {
    return {
      id: parseInt(payload.sub),
      email: payload.email,
    };
  }
}
