import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { ImageRecognitionController } from './image-recognition.controller';
import { ImageRecognitionService } from './image-recognition.service';
import { KafkaService } from './kafka/kafka.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ImageRecognitionController],
  providers: [ImageRecognitionService, KafkaService],
  exports: [ImageRecognitionService],
})
export class ImageRecognitionModule {}
