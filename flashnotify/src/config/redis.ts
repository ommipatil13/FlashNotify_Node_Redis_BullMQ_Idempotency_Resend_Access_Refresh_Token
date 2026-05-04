import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error('REDIS_URL is not defined in .env');
}

export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required for BullMQ
});

redisConnection.on('connect', () => console.log('✅ Redis Connected'));
redisConnection.on('error', (err) => console.error('❌ Redis Error:', err));
