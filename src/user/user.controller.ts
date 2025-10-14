import { AccessTokenGuard } from '@app/auth/guards/accessToken.guard';
import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

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
  async findAll() {
    const users = await this.userService.findAll();

    return {
      users,
    };
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  async findMe(@User('id') id: number) {
    const user = await this.userService.findById(id);

    const responseUser = await this.userService.constructResponseUser(user);

    return {
      user: responseUser,
    };
  }

  @Patch('me')
  @UseGuards(AccessTokenGuard)
  async updateMe(@User('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(id, updateUserDto);

    const responseUser = await this.userService.constructResponseUser(user);

    return {
      user: responseUser,
    };
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  async findById(@Param('id') id: string) {
    const user = await this.userService.findById(+id);

    const responseUser = await this.userService.constructResponseUser(user);

    return {
      user: responseUser,
    };
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  async delete(@Param('id') id: string) {
    const user = await this.userService.delete(+id);

    const responseUser = await this.userService.constructResponseUser(user);

    return {
      user: responseUser,
    };
  }
}
