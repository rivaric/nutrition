import { DatabaseService } from '@app/database/database.service';
import { UserService } from '@app/user/user.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as isoWeek from 'dayjs/plugin/isoWeek';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { Meal, Prisma } from 'generated/prisma';

import { CreateMealDto } from './dto/createMeal.dto';
import { MealStatisticsQueryDto } from './dto/mealStatisticsQuery.dto';
import { UpdateMealDto } from './dto/updateMeal.dto';

dayjs.extend(isoWeek);
dayjs.extend(utc);
dayjs.extend(timezone);

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
      include: {
        dishes: {
          include: {
            dish: true,
          },
        },
      },
    });

    return meals;
  }

  async create(userId: number, createMealDto: CreateMealDto) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const { dishes, ...mealData } = createMealDto;

    const nutrition =
      dishes && dishes.length > 0
        ? await this.calculateNutritionFromDishes(dishes)
        : this.validateAndGetNutrition(mealData);

    const meal = await this.databaseService.meal.create({
      data: {
        ...mealData,
        ...nutrition,
        userId,
        dishes:
          dishes && dishes.length > 0
            ? {
                create: dishes.map((item) => ({
                  dishId: item.dishId,
                })),
              }
            : undefined,
      },
      include: {
        dishes: {
          include: {
            dish: true,
          },
        },
      },
    });

    return meal;
  }

  private async calculateNutritionFromDishes(
    dishInputs: { dishId: number; weight: number }[],
  ): Promise<{ calories: number; protein: number; fat: number; carbs: number; weight: number }> {
    const dishIds = dishInputs.map((d) => d.dishId);
    const dishes = await this.databaseService.dish.findMany({
      where: {
        id: {
          in: dishIds,
        },
      },
    });

    if (dishes.length !== dishIds.length) {
      throw new HttpException('One or more dishes not found', HttpStatus.BAD_REQUEST);
    }

    const dishById = new Map(dishes.map((d) => [d.id, d]));

    const aggregate = dishInputs.reduce(
      (acc, input) => {
        const dish = dishById.get(input.dishId);
        if (!dish) return acc;

        const factor = input.weight / 100;

        return {
          calories: acc.calories + dish.calories * factor,
          protein: acc.protein + dish.protein * factor,
          fat: acc.fat + dish.fat * factor,
          carbs: acc.carbs + dish.carbs * factor,
          weight: acc.weight + input.weight,
        };
      },
      {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        weight: 0,
      },
    );

    return {
      calories: +aggregate.calories.toFixed(1),
      protein: +aggregate.protein.toFixed(1),
      fat: +aggregate.fat.toFixed(1),
      carbs: +aggregate.carbs.toFixed(1),
      weight: aggregate.weight,
    };
  }

  private validateAndGetNutrition(mealData: Omit<CreateMealDto, 'dishes'>): {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    weight?: number;
  } {
    if (
      mealData.calories === undefined ||
      mealData.protein === undefined ||
      mealData.fat === undefined ||
      mealData.carbs === undefined
    ) {
      throw new HttpException(
        'Either dishIds or КБЖУ (calories, protein, fat, carbs) must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      calories: mealData.calories,
      protein: mealData.protein,
      fat: mealData.fat,
      carbs: mealData.carbs,
      weight: mealData.weight,
    };
  }

  async update(userId: number, mealId: number, updateMealDto: UpdateMealDto) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const updatedMeal = await this.databaseService.meal.update({
      where: { id: mealId },
      data: updateMealDto,
    });

    return updatedMeal;
  }

  async delete(userId: number, mealId: number) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const deletedMeal = await this.databaseService.meal.delete({
      where: { id: mealId },
    });

    return deletedMeal;
  }

  async getStatistics(userId: number, query: MealStatisticsQueryDto) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const { startDate, endDate, groupBy } = query;

    if (startDate > endDate) {
      throw new HttpException('Start date must be before end date', HttpStatus.BAD_REQUEST);
    }

    const where: Prisma.MealWhereInput = {
      userId,
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    const meals = await this.databaseService.meal.findMany({ where });
    const total = meals.reduce(
      (acc, meal) => {
        return {
          calories: acc.calories + meal.calories,
          protein: acc.protein + meal.protein,
          fat: acc.fat + meal.fat,
          carbs: acc.carbs + meal.carbs,
        };
      },
      {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      },
    );

    const groupedMeals = meals.reduce(
      (acc, meal) => {
        const date = dayjs(meal.createdAt).tz('UTC');
        let key: string;

        switch (groupBy) {
          case 'week': {
            const startOfWeek = date.startOf('isoWeek');
            const endOfWeek = date.endOf('isoWeek');
            key = `${startOfWeek.format('D MMM')}–${endOfWeek.format('D MMM YYYY')}`;
            break;
          }
          case 'month':
            key = date.format('MMMM YYYY');
            break;
          default:
            key = date.format('YYYY-MM-DD');
        }

        if (!acc[key]) acc[key] = [];
        acc[key].push(meal);
        return acc;
      },
      {} as Record<string, Meal[]>,
    );

    const totalMeals = meals.length;
    const data = Object.entries(groupedMeals).map(([key, meals]) => ({
      label: key,
      calories: meals.reduce((acc, meal) => acc + meal.calories, 0),
      protein: meals.reduce((acc, meal) => acc + meal.protein, 0),
      fat: meals.reduce((acc, meal) => acc + meal.fat, 0),
      carbs: meals.reduce((acc, meal) => acc + meal.carbs, 0),
      count: meals.length,
    }));

    return {
      totalMeals,
      total,
      averages: {
        calories: +(total.calories / totalMeals).toFixed(1),
        protein: +(total.protein / totalMeals).toFixed(1),
        fat: +(total.fat / totalMeals).toFixed(1),
        carbs: +(total.carbs / totalMeals).toFixed(1),
      },
      data,
    };
  }
}
