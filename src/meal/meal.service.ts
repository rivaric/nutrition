import { DatabaseService } from '@app/database/database.service';
import { UserService } from '@app/user/user.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { CreateMealDto } from './dto/createMeal.dto';
import { UpdateMealDto } from './dto/updateMeal.dto';

@Injectable()
export class MealService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly userService: UserService,
  ) {}

  async findAllByUser(userId: number) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const meals = await this.databaseService.meal.findMany({
      where: { userId },
    });

    return meals;
  }

  async create(userId: number, createMealDto: CreateMealDto) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const meal = await this.databaseService.meal.create({
      data: {
        ...createMealDto,
        userId,
      },
    });

    return meal;
  }

  async update(userId: number, mealId: number, updateMealDto: UpdateMealDto) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const updatedMeal = await this.databaseService.meal.updateMany({
      where: { id: mealId, userId },
      data: updateMealDto,
    });

    if (updatedMeal.count === 0) {
      throw new HttpException(
        'Meal not found or does not belong to this user',
        HttpStatus.FORBIDDEN,
      );
    }

    return updatedMeal;
  }

  async delete(userId: number, mealId: number) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const deletedMeal = await this.databaseService.meal.deleteMany({
      where: { id: mealId, userId },
    });

    if (deletedMeal.count === 0) {
      throw new HttpException(
        'Meal not found or does not belong to this user',
        HttpStatus.FORBIDDEN,
      );
    }

    return deletedMeal;
  }
}
