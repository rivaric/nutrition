import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Consumer, Kafka, KafkaConfig, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private producer: Producer;
  private kafka: Kafka;
  private isConnected = false;
  private consumer: Consumer | null = null;
  private isConsumerRunning = false;
  private readonly pendingResponses = new Map<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (error: Error) => void;
      timeout: NodeJS.Timeout;
    }
  >();

  constructor() {
    const kafkaConfig: KafkaConfig = {
      clientId: 'nutrition-service',
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    };

    this.kafka = new Kafka(kafkaConfig);
    this.producer = this.kafka.producer();
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      try {
        await this.producer.disconnect();
        this.isConnected = false;
      } catch (error) {
        this.logger.error('Error disconnecting from Kafka', error);
      }
    }

    if (this.consumer && this.isConsumerRunning) {
      try {
        await this.consumer.disconnect();
        this.isConsumerRunning = false;
      } catch (error) {
        this.logger.error('Error disconnecting Kafka consumer', error);
      }
    }
  }

  private async ensureConnected() {
    if (!this.isConnected) {
      try {
        await this.producer.connect();
        this.isConnected = true;
        this.logger.log('Connected to Kafka');
      } catch (error) {
        this.logger.error('Failed to connect to Kafka', error);
        this.isConnected = false;
        throw error;
      }
    }
  }

  async sendImageForRecognition(imageBuffer: Buffer, requestId: string) {
    try {
      await this.ensureConnected();

      const topic = process.env.KAFKA_IMAGE_RECOGNITION_TOPIC || 'food_images';

      const payload = {
        image_id: requestId,
        image_b64: imageBuffer.toString('base64'),
      };

      await this.producer.send({
        topic,
        messages: [
          {
            key: requestId,
            value: JSON.stringify(payload),
          },
        ],
      });

      this.logger.log(`Image sent to Kafka topic ${topic} with requestId: ${requestId}`);
    } catch (error) {
      this.logger.error(`Failed to send image to Kafka: ${error.message}`, error.stack);
      this.isConnected = false;
      throw error;
    }
  }

  private async ensureConsumer() {
    if (this.consumer && this.isConsumerRunning) return;

    if (!this.consumer) {
      this.consumer = this.kafka.consumer({
        groupId:
          process.env.KAFKA_IMAGE_RECOGNITION_CONSUMER_GROUP || 'nutrition-image-recognition',
      });
    }

    const topic = process.env.KAFKA_IMAGE_RECOGNITION_RESPONSE_TOPIC || 'food_cls';

    await this.consumer.connect();
    await this.consumer.subscribe({ topic, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        try {
          if (!message.value) return;

          const raw = message.value.toString('utf8');
          const data = JSON.parse(raw) as {
            image_id?: string;
            top1_class?: string;
            estimated_weight_g?: number;
          };

          const requestId = data.image_id;
          if (!requestId) {
            this.logger.warn('Received Kafka message without image_id, skipping');
            return;
          }

          const entry = this.pendingResponses.get(requestId);
          if (!entry) {
            this.logger.warn(`No pending handler for image_id=${requestId}, skipping`);
            return;
          }

          entry.resolve(data);
          clearTimeout(entry.timeout);
          this.pendingResponses.delete(requestId);
        } catch (error) {
          this.logger.error('Error while processing Kafka response message', error as Error);
        }
      },
    });

    this.isConsumerRunning = true;
    this.logger.log(`Kafka consumer started for topic ${topic}`);
  }

  async waitForRecognitionResponse(requestId: string, timeoutMs = 20000): Promise<unknown> {
    await this.ensureConsumer();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingResponses.delete(requestId);
        reject(new Error('Recognition response timeout'));
      }, timeoutMs);

      this.pendingResponses.set(requestId, { resolve, reject, timeout });
    });
  }
}
