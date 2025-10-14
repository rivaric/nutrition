import { UserService } from '@app/user/user.service';
import { hashData } from '@app/utils/hashData';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.userService.findByEmail(registerDto.email);

    if (user) {
      throw new HttpException('User already exists', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const hashedPassword = await hashData(registerDto.password);

    const newUser = await this.userService.create({
      ...registerDto,
      password: hashedPassword,
    });

    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);

    return {
      ...tokens,
      user: newUser,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new HttpException('Invalid password', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: user,
    };
  }

  async logout(userId: number) {
    return this.userService.update(userId, { refreshToken: null });
  }

  async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      // @ts-ignore
      this.jwtService.signAsync(
        { sub: userId.toString(), email },
        {
          expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
          secret: process.env.JWT_ACCESS_SECRET,
        },
      ),
      // @ts-ignore
      this.jwtService.signAsync(
        { sub: userId.toString(), email },
        {
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
          secret: process.env.JWT_REFRESH_SECRET,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.userService.findById(userId);

    if (!user || !user.refreshToken) {
      throw new HttpException('Access denied', HttpStatus.UNAUTHORIZED);
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isRefreshTokenValid) {
      throw new HttpException('Access denied', HttpStatus.UNAUTHORIZED);
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: user,
    };
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await hashData(refreshToken);
    await this.userService.update(userId, { refreshToken: hashedRefreshToken });
  }
}
