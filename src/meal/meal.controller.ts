import { AccessTokenGuard } from '@app/auth/guards/accessToken.guard';
import { User } from '@app/user/decorators/user.decorator';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CreateMealDto } from './dto/createMeal.dto';
import { UpdateMealDto } from './dto/updateMeal.dto';
import { MealService } from './meal.service';

@ApiTags('Meals')
@ApiBearerAuth('accessToken')
@Controller('meals')
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Get('me')
  @UseGuards(AccessTokenGuard)
  async findAllByUser(@User('id') userId: number) {
    const meals = await this.mealService.findAllByUser(userId);

    return meals;
  }

  @Post('me')
  @UseGuards(AccessTokenGuard)
  async createMeal(@User('id') userId: number, @Body() createMealDto: CreateMealDto) {
    const meal = await this.mealService.create(+userId, createMealDto);

    return meal;
  }

  @Patch('me/:mealId')
  @UseGuards(AccessTokenGuard)
  async updateMeal(
    @User('id') userId: number,
    @Param('mealId') mealId: number,
    @Body() updateMealDto: UpdateMealDto,
  ) {
    const meal = await this.mealService.update(+userId, +mealId, updateMealDto);

    return meal;
  }

  @Delete('me/:mealId')
  @UseGuards(AccessTokenGuard)
  async deleteMeal(@User('id') userId: number, @Param('mealId') mealId: number) {
    const meal = await this.mealService.delete(+userId, +mealId);

    return meal;
  }
}
