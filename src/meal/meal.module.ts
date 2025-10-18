import { DatabaseModule } from '@app/database/database.module';
import { UserModule } from '@app/user/user.module';
import { Module } from '@nestjs/common';

import { MealController } from './meal.controller';
import { MealService } from './meal.service';

@Module({
  imports: [DatabaseModule, UserModule],
  controllers: [MealController],
  providers: [MealService],
})
export class MealModule {}
