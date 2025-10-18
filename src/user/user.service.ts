import { DatabaseService } from '@app/database/database.service';
import { hashData } from '@app/utils/hashData';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    return await this.databaseService.user.findMany({
      omit: { password: true, refreshToken: true },
    });
  }

  async findByEmail(email: string) {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

    return user;
  }

  async findById(id: number) {
    const user = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    return user;
  }

  async create(user: Prisma.UserCreateInput) {
    return await this.databaseService.user.create({
      data: user,
    });
  }

  async update(userId: number, user: Prisma.UserUpdateInput) {
    if (user.password) {
      user.password = await hashData(user.password as string);
    }

    return await this.databaseService.user.update({
      where: { id: userId },
      data: user,
    });
  }

  async delete(id: number) {
    return await this.databaseService.user.delete({
      where: { id },
    });
  }

  async constructResponseUser(user: User) {
    const {
      password: _password,
      refreshToken: _refreshToken,
      ...userWithoutPasswordAndRefreshToken
    } = user;
    return {
      ...userWithoutPasswordAndRefreshToken,
    };
  }
}
