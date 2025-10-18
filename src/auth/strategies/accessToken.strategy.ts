import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '../types/jwtPayload';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'JWT_ACCESS_SECRET',
    });
  }

  validate(payload: JwtPayload) {
    return {
      id: parseInt(payload.sub),
      email: payload.email,
    };
  }
}
