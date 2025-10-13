import { User } from '@app/user/decorators/user.decorator';
import { UserService } from '@app/user/user.service';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Req() req: Request, @Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);

    req.res?.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const responseUser = await this.userService.constructResponseUser(result.user);
    return {
      accessToken: result.accessToken,
      user: responseUser,
    };
  }

  @Post('login')
  async login(@Req() req: Request, @Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);

    req.res?.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const responseUser = await this.userService.constructResponseUser(result.user);
    return {
      accessToken: result.accessToken,
      user: responseUser,
    };
  }

  @ApiBearerAuth('accessToken')
  @Get('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(@User('id') userId: number, @Req() req: Request) {
    const result = await this.authService.refreshTokens(userId, req.cookies['refreshToken']);

    const responseUser = await this.userService.constructResponseUser(result.user);

    return {
      accessToken: result.accessToken,
      user: responseUser,
    };
  }

  @ApiBearerAuth('accessToken')
  @Get('logout')
  @UseGuards(AccessTokenGuard)
  async logout(@User('id') userId: number, @Req() req: Request) {
    const user = await this.authService.logout(userId);

    const responseUser = await this.userService.constructResponseUser(user);

    req.res?.clearCookie('refreshToken');

    return {
      user: responseUser,
    };
  }
}
