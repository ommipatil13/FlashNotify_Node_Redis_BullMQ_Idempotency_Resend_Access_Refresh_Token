import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

export const kafka = new Kafka({
  clientId: 'flashnotify',
  brokers: [process.env.KAFKA_BROKER as string],
  ssl: true,
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_USERNAME as string,
    password: process.env.KAFKA_PASSWORD as string,
  },
});

export const producer = kafka.producer();

export const connectKafka = async () => {
  try {
    await producer.connect();
    console.log('✅ Kafka Producer Connected');
  } catch (error) {
    console.error('❌ Kafka Connection Error:', error);
  }
};
