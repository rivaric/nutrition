import { ApiProperty } from '@nestjs/swagger';

export class RecognitionResponseDto {
  @ApiProperty({
    description: 'Название блюда на русском',
    example: 'Стейк',
  })
  name: string;

  @ApiProperty({
    description: 'ID блюда в таблице Dish (для привязки к meal)',
    example: 42,
  })
  dishId: number | null;

  @ApiProperty({
    description: 'Вес блюда в граммах',
    example: 250.5,
  })
  weight: number;

  @ApiProperty({
    description: 'Калории на порцию (с учётом веса)',
    example: 800,
  })
  calories: number;

  @ApiProperty({
    description: 'Белки на порцию (с учётом веса), грамм',
    example: 40,
  })
  protein: number;

  @ApiProperty({
    description: 'Жиры на порцию (с учётом веса), грамм',
    example: 35,
  })
  fat: number;

  @ApiProperty({
    description: 'Углеводы на порцию (с учётом веса), грамм',
    example: 20,
  })
  carbs: number;
}
