import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { MealModule } from './meal/meal.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule, DatabaseModule, AuthModule, MealModule],
})
export class AppModule {}
