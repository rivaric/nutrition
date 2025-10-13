import { AccessTokenGuard } from '@app/auth/guards/accessToken.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth('accessToken')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  async findAll() {
    const users = await this.userService.findAll();

    return {
      users,
    };
  }
}
