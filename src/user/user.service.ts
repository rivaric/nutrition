import { DatabaseService } from '@app/database/database.service';
import { Injectable } from '@nestjs/common';
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
    return await this.databaseService.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number) {
    return await this.databaseService.user.findUnique({
      where: { id },
    });
  }

  async create(user: Prisma.UserCreateInput) {
    return await this.databaseService.user.create({
      data: user,
    });
  }

  async update(userId: number, user: Prisma.UserUpdateInput) {
    return await this.databaseService.user.update({
      where: { id: userId },
      data: user,
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
