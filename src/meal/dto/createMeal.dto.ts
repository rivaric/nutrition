import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { MealType } from 'generated/prisma';

export class MealDishInputDto {
  @ApiProperty({
    description: 'Dish ID',
    example: 24,
  })
  @IsNumber()
  dishId: number;

  @ApiProperty({
    description: 'Weight of this dish in grams',
    example: 320,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  weight: number;
}

export class CreateMealDto {
  @ApiProperty({
    description: 'Meal name',
    example: 'Grilled Chicken Salad',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Type of meal',
    enum: MealType,
    example: MealType.LUNCH,
  })
  @IsEnum(MealType)
  mealType: MealType;

  @ApiProperty({
    description:
      'Array of dishes with their weights in grams. If provided, nutrition and total weight will be calculated automatically',
    required: false,
    type: [MealDishInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealDishInputDto)
  dishes?: MealDishInputDto[];

  @ApiProperty({
    description: 'Calories in the meal. Required if dishes is not provided',
    example: 350.5,
    minimum: 0,
    required: false,
  })
  @ValidateIf((o) => !o.dishes || o.dishes.length === 0)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  calories?: number;

  @ApiProperty({
    description: 'Protein content in grams. Required if dishes is not provided',
    example: 25.0,
    minimum: 0,
    required: false,
  })
  @ValidateIf((o) => !o.dishes || o.dishes.length === 0)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  protein?: number;

  @ApiProperty({
    description: 'Fat content in grams. Required if dishes is not provided',
    example: 12.5,
    minimum: 0,
    required: false,
  })
  @ValidateIf((o) => !o.dishes || o.dishes.length === 0)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  fat?: number;

  @ApiProperty({
    description: 'Carbohydrates content in grams. Required if dishes is not provided',
    example: 15.0,
    minimum: 0,
    required: false,
  })
  @ValidateIf((o) => !o.dishes || o.dishes.length === 0)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  carbs?: number;

  @ApiProperty({
    description: 'Meal weight in grams',
    example: 320,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiProperty({
    description: 'Optional meal description',
    example: 'Healthy salad with grilled chicken breast',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
