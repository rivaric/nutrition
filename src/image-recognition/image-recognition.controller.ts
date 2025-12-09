import { AccessTokenGuard } from '@app/auth/guards/accessToken.guard';
import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ImageRecognitionService } from './image-recognition.service';

@ApiTags('Image Recognition')
@ApiBearerAuth('accessToken')
@Controller('image-recognition')
export class ImageRecognitionController {
  constructor(private readonly imageRecognitionService: ImageRecognitionService) {}

  @Post('recognize')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Upload image for dish recognition',
    description:
      'Uploads an image and sends it via Kafka for dish recognition. Returns request ID.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Image recognized successfully',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Стейк',
          description: 'Human readable dish name in Russian',
        },
        dishId: {
          type: 'number',
          example: 42,
          description: 'Dish ID in database (can be used when creating a meal)',
        },
        weight: {
          type: 'number',
          example: 320,
          description: 'Estimated dish weight in grams',
        },
        calories: {
          type: 'number',
          example: 800,
          description: 'Calories for the portion (with weight applied)',
        },
        protein: {
          type: 'number',
          example: 40,
          description: 'Protein for the portion, grams',
        },
        fat: {
          type: 'number',
          example: 35,
          description: 'Fat for the portion, grams',
        },
        carbs: {
          type: 'number',
          example: 20,
          description: 'Carbs for the portion, grams',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or file not provided',
  })
  @ApiResponse({
    status: 422,
    description: 'No dishes detected on image',
  })
  async recognizeDish(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('Image file is required', HttpStatus.BAD_REQUEST);
    }

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new HttpException(
        'Invalid file type. Only JPEG, PNG, and WebP are allowed',
        HttpStatus.BAD_REQUEST,
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new HttpException('File size exceeds 10MB limit', HttpStatus.BAD_REQUEST);
    }

    const result = await this.imageRecognitionService.processImage(file.buffer);

    return result;
  }
}
