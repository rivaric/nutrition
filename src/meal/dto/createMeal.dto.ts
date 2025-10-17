import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { MealType } from 'generated/prisma';

export class CreateMealDto {
  @ApiProperty({
    description: 'Meal name',
    example: 'Grilled Chicken Salad',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of meal',
    enum: MealType,
    example: MealType.LUNCH,
  })
  @IsEnum(MealType)
  mealType: MealType;

  @ApiProperty({
    description: 'Calories in the meal',
    example: 350.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  calories: number;

  @ApiProperty({
    description: 'Protein content in grams',
    example: 25.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  protein: number;

  @ApiProperty({
    description: 'Fat content in grams',
    example: 12.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  fat: number;

  @ApiProperty({
    description: 'Carbohydrates content in grams',
    example: 15.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  carbs: number;

  @ApiProperty({
    description: 'Optional meal description',
    example: 'Healthy salad with grilled chicken breast',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
