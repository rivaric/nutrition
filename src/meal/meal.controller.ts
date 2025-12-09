import { AccessTokenGuard } from '@app/auth/guards/accessToken.guard';
import { User } from '@app/user/decorators/user.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CreateMealDto } from './dto/createMeal.dto';
import { MealStatisticsQueryDto } from './dto/mealStatisticsQuery.dto';
import { UpdateMealDto } from './dto/updateMeal.dto';
import { MealOwnershipGuard } from './guards/meal-ownership.guard';
import { MealService } from './meal.service';

@ApiTags('Meals')
@ApiBearerAuth('accessToken')
@Controller('meals')
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: 'Get all meals for current user',
    description: 'Retrieves all meals belonging to the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user meals retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        meals: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Grilled Chicken Salad' },
              mealType: { type: 'string', example: 'LUNCH' },
              calories: { type: 'number', example: 350.5 },
              protein: { type: 'number', example: 25.0 },
              fat: { type: 'number', example: 12.5 },
              carbs: { type: 'number', example: 15.0 },
              weight: { type: 'number', example: 320, description: 'Meal weight in grams' },
              description: { type: 'string', example: 'Healthy salad with grilled chicken breast' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async findAllByUser(@User('id') userId: number) {
    const meals = await this.mealService.findAllByUser(userId);

    return {
      meals,
    };
  }

  @Post('me')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: 'Create new meal',
    description: 'Creates a new meal for the currently authenticated user',
  })
  @ApiBody({
    type: CreateMealDto,
    description: 'Meal creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Meal created successfully',
    schema: {
      type: 'object',
      properties: {
        meal: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Grilled Chicken Salad' },
            mealType: { type: 'string', example: 'LUNCH' },
            calories: { type: 'number', example: 350.5 },
            protein: { type: 'number', example: 25 },
            fat: { type: 'number', example: 12.5 },
            carbs: { type: 'number', example: 15 },
            weight: { type: 'number', example: 320, description: 'Meal weight in grams' },
            description: { type: 'string', example: 'Healthy salad with grilled chicken breast' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async createMeal(@User('id') userId: number, @Body() createMealDto: CreateMealDto) {
    const meal = await this.mealService.create(+userId, createMealDto);

    return {
      meal,
    };
  }

  @Patch('me/:mealId')
  @UseGuards(AccessTokenGuard, MealOwnershipGuard)
  @ApiOperation({
    summary: 'Update meal',
    description: 'Updates an existing meal belonging to the currently authenticated user',
  })
  @ApiParam({
    name: 'mealId',
    description: 'Meal ID',
    type: 'number',
    example: 1,
  })
  @ApiBody({
    type: UpdateMealDto,
    description: 'Meal update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Meal updated successfully',
    schema: {
      type: 'object',
      properties: {
        meal: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Grilled Chicken Salad' },
            mealType: { type: 'string', example: 'LUNCH' },
            calories: { type: 'number', example: 350.5 },
            protein: { type: 'number', example: 25.0 },
            fat: { type: 'number', example: 12.5 },
            carbs: { type: 'number', example: 15.0 },
            weight: { type: 'number', example: 320, description: 'Meal weight in grams' },
            description: { type: 'string', example: 'Healthy salad with grilled chicken breast' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async updateMeal(
    @User('id') userId: number,
    @Param('mealId') mealId: number,
    @Body() updateMealDto: UpdateMealDto,
  ) {
    const meal = await this.mealService.update(+userId, +mealId, updateMealDto);

    return {
      meal,
    };
  }

  @Delete('me/:mealId')
  @UseGuards(AccessTokenGuard, MealOwnershipGuard)
  @ApiOperation({
    summary: 'Delete meal',
    description: 'Deletes an existing meal belonging to the currently authenticated user',
  })
  @ApiParam({
    name: 'mealId',
    description: 'Meal ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Meal deleted successfully',
    schema: {
      type: 'object',
      properties: {
        meal: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Grilled Chicken Salad' },
            mealType: { type: 'string', example: 'LUNCH' },
            calories: { type: 'number', example: 350.5 },
            protein: { type: 'number', example: 25.0 },
            fat: { type: 'number', example: 12.5 },
            carbs: { type: 'number', example: 15.0 },
            weight: { type: 'number', example: 320, description: 'Meal weight in grams' },
            description: { type: 'string', example: 'Healthy salad with grilled chicken breast' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async deleteMeal(@User('id') userId: number, @Param('mealId') mealId: number) {
    const deletedMeal = await this.mealService.delete(+userId, +mealId);

    return {
      meal: deletedMeal,
    };
  }

  @Get('me/statistics')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: 'Get meal statistics',
    description: 'Retrieves nutritional statistics for meals within a specified date range',
  })
  async getStatistics(@User('id') userId: number, @Query() query: MealStatisticsQueryDto) {
    const statistics = await this.mealService.getStatistics(userId, query);

    return {
      statistics,
    };
  }
}
