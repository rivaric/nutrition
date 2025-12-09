import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { DatabaseService } from '../database/database.service';
import { RecognitionResponseDto } from './dto/recognition-response.dto';
import { KafkaService } from './kafka/kafka.service';

@Injectable()
export class ImageRecognitionService {
  private readonly logger = new Logger(ImageRecognitionService.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly databaseService: DatabaseService,
  ) {}

  async processImage(imageBuffer: Buffer): Promise<RecognitionResponseDto> {
    const requestId = uuidv4();

    try {
      await this.kafkaService.sendImageForRecognition(imageBuffer, requestId);

      const rawResponse = (await this.kafkaService.waitForRecognitionResponse(requestId)) as {
        image_id?: string;
        top1_class?: string;
        estimated_weight_g?: number;
      };

      const top1 = rawResponse.top1_class?.trim();
      const weight = rawResponse.estimated_weight_g;

      if (!top1 || weight == null || weight <= 0) {
        if (!top1) {
          throw new HttpException('No dishes detected on image', HttpStatus.UNPROCESSABLE_ENTITY);
        }

        this.logger.error(
          `Invalid recognition response for requestId=${requestId}: ${JSON.stringify(rawResponse)}`,
        );
        throw new HttpException(
          'Invalid response from recognition service',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const slug = top1;

      const dish = await this.databaseService.dish.findFirst({
        where: { slug },
      });

      if (!dish) {
        this.logger.warn(
          `Dish with slug "${slug}" not found in DB. Returning recognition result without nutrition.`,
        );

        return {
          name: slug,
          dishId: null,
          weight,
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
        };
      }

      const factor = weight / 100;

      const result: RecognitionResponseDto = {
        name: dish.name,
        dishId: dish.id,
        weight,
        calories: +(dish.calories * factor).toFixed(1),
        protein: +(dish.protein * factor).toFixed(1),
        fat: +(dish.fat * factor).toFixed(1),
        carbs: +(dish.carbs * factor).toFixed(1),
      };

      return result;
    } catch (error) {
      this.logger.error(`Failed to process image: ${error.message}`, error.stack);

      if (error.code === 'ECONNREFUSED' || error.message?.includes('Connection error')) {
        throw new HttpException(
          'Kafka service is unavailable. Please try again later.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      throw new HttpException(
        'Failed to send image for recognition',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  handleRecognitionResponse(requestId: string, response: RecognitionResponseDto) {
    return response;
  }
}
