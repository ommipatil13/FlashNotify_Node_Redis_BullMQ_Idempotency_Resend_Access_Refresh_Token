import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

// Create a new queue called 'notifications'
export const notificationQueue = new Queue('notifications', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Retry 3 times if it fails
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true, // Clean up successful jobs to save Redis memory
  },
});

console.log('✅ Notification Queue Initialized');
