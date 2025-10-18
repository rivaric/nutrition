import { User } from '@app/user/decorators/user.decorator';
import { UserService } from '@app/user/user.service';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({
    summary: 'Register new user',
    description: 'Creates a new user in the system and returns access tokens',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration data',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'JWT access token',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            age: { type: 'number', example: 25 },
            gender: { type: 'string', example: 'MALE' },
            heightCm: { type: 'number', example: 175.5 },
            weightKg: { type: 'number', example: 70.5 },
            targetWeight: { type: 'number', example: 65 },
            activityLevel: { type: 'string', example: 'MODERATELY_ACTIVE' },
            goal: { type: 'string', example: 'LOSE_WEIGHT' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
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
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user by email and password',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'JWT access token',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            age: { type: 'number', example: 25 },
            gender: { type: 'string', example: 'MALE' },
            heightCm: { type: 'number', example: 175.5 },
            weightKg: { type: 'number', example: 70.5 },
            targetWeight: { type: 'number', example: 65 },
            activityLevel: { type: 'string', example: 'MODERATELY_ACTIVE' },
            goal: { type: 'string', example: 'LOSE_WEIGHT' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
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

  @Get('refresh')
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({
    summary: 'Refresh access tokens',
    description: 'Updates access token using refresh token from cookies',
  })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({
    status: 200,
    description: 'Tokens successfully refreshed',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'New JWT access token',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            age: { type: 'number', example: 25 },
            gender: { type: 'string', example: 'MALE' },
            heightCm: { type: 'number', example: 175.5 },
            weightKg: { type: 'number', example: 70.5 },
            targetWeight: { type: 'number', example: 65 },
            activityLevel: { type: 'string', example: 'MODERATELY_ACTIVE' },
            goal: { type: 'string', example: 'LOSE_WEIGHT' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async refresh(@User('id') userId: number, @Req() req: Request) {
    const result = await this.authService.refreshTokens(userId, req.cookies['refreshToken']);

    const responseUser = await this.userService.constructResponseUser(result.user);

    return {
      accessToken: result.accessToken,
      user: responseUser,
    };
  }

  @Get('logout')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: 'User logout',
    description: 'Ends user session and clears refresh token',
  })
  @ApiBearerAuth('accessToken')
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            age: { type: 'number', example: 25 },
            gender: { type: 'string', example: 'MALE' },
            heightCm: { type: 'number', example: 175.5 },
            weightKg: { type: 'number', example: 70.5 },
            targetWeight: { type: 'number', example: 65 },
            activityLevel: { type: 'string', example: 'MODERATELY_ACTIVE' },
            goal: { type: 'string', example: 'LOSE_WEIGHT' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async logout(@User('id') userId: number, @Req() req: Request) {
    const user = await this.authService.logout(userId);

    const responseUser = await this.userService.constructResponseUser(user);

    req.res?.clearCookie('refreshToken');

    return {
      user: responseUser,
    };
  }
}
