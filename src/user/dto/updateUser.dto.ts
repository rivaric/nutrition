import { IsEmail, IsOptional, IsString, IsInt, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ActivityLevel {
  SEDENTARY = 'SEDENTARY',
  LIGHTLY_ACTIVE = 'LIGHTLY_ACTIVE',
  MODERATELY_ACTIVE = 'MODERATELY_ACTIVE',
  VERY_ACTIVE = 'VERY_ACTIVE',
}

export enum GoalType {
  LOSE_WEIGHT = 'LOSE_WEIGHT',
  MAINTAIN_WEIGHT = 'MAINTAIN_WEIGHT',
  GAIN_WEIGHT = 'GAIN_WEIGHT',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
    format: 'email',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'User password',
    example: 'newPassword123',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    description: 'User age in years',
    example: 25,
    minimum: 1,
    maximum: 120,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  age?: number;

  @ApiProperty({
    description: 'User gender',
    enum: Gender,
    example: Gender.MALE,
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({
    description: 'User height in centimeters',
    example: 175.5,
    minimum: 50,
    maximum: 250,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(250)
  heightCm?: number;

  @ApiProperty({
    description: 'User weight in kilograms',
    example: 70.5,
    minimum: 20,
    maximum: 300,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(300)
  weightKg?: number;

  @ApiProperty({
    description: 'Target weight in kilograms',
    example: 65.0,
    minimum: 20,
    maximum: 300,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(300)
  targetWeight?: number;

  @ApiProperty({
    description: 'User activity level',
    enum: ActivityLevel,
    example: ActivityLevel.MODERATELY_ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;

  @ApiProperty({
    description: 'User fitness goal',
    enum: GoalType,
    example: GoalType.LOSE_WEIGHT,
    required: false,
  })
  @IsOptional()
  @IsEnum(GoalType)
  goal?: GoalType;
}
