import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { MealType } from 'generated/prisma';

export class CreateMealDto {
  @IsString()
  name: string;

  @IsEnum(MealType)
  mealType: MealType;

  @IsNumber()
  calories: number;

  @IsNumber()
  protein: number;

  @IsNumber()
  fat: number;

  @IsNumber()
  carbs: number;

  @IsOptional()
  @IsString()
  description?: string;
}
