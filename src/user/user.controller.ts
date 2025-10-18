import { AccessTokenGuard } from '@app/auth/guards/accessToken.guard';
import { Body, Controller, Delete, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { User } from './decorators/user.decorator';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth('accessToken')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves a list of all users in the system (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', example: 'john@example.com' },
              age: { type: 'number', example: 25 },
              gender: { type: 'string', example: 'MALE' },
              heightCm: { type: 'number', example: 175.5 },
              weightKg: { type: 'number', example: 70.5 },
              targetWeight: { type: 'number', example: 65.0 },
              activityLevel: { type: 'string', example: 'MODERATELY_ACTIVE' },
              goal: { type: 'string', example: 'LOSE_WEIGHT' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async findAll() {
    const users = await this.userService.findAll();

    return {
      users,
    };
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves the profile information of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user profile retrieved successfully',
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
            targetWeight: { type: 'number', example: 65.0 },
            activityLevel: { type: 'string', example: 'MODERATELY_ACTIVE' },
            goal: { type: 'string', example: 'LOSE_WEIGHT' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async findMe(@User('id') id: number) {
    const user = await this.userService.findById(id);

    const responseUser = await this.userService.constructResponseUser(user);

    return {
      user: responseUser,
    };
  }

  @Patch('me')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Updates the profile information of the currently authenticated user',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User profile update data',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
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
            targetWeight: { type: 'number', example: 65.0 },
            activityLevel: { type: 'string', example: 'MODERATELY_ACTIVE' },
            goal: { type: 'string', example: 'LOSE_WEIGHT' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async updateMe(@User('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(id, updateUserDto);

    const responseUser = await this.userService.constructResponseUser(user);

    return {
      user: responseUser,
    };
  }

  @Delete('me')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: 'Delete current user account',
    description: 'Deletes the currently authenticated user account',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user account deleted successfully',
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
            targetWeight: { type: 'number', example: 65.0 },
            activityLevel: { type: 'string', example: 'MODERATELY_ACTIVE' },
            goal: { type: 'string', example: 'LOSE_WEIGHT' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async delete(@User('id') id: number) {
    const user = await this.userService.delete(id);

    const responseUser = await this.userService.constructResponseUser(user);

    return {
      user: responseUser,
    };
  }
}
