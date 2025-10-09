import { DatabaseService } from '@app/database/database.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}
  async findAll() {
    return await this.databaseService.user.findMany();
  }
}
