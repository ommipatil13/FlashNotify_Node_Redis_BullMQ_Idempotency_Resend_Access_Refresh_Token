import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { Resend } from 'resend';
import Notification from '../models/Notification';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const SIMULATE = true; // Set to false when you have a verified domain and paid plan

export const initWorker = () => {
  const worker = new Worker('notifications', async (job: Job) => {
    const { notificationId, recipient, subject, content } = job.data;

    try {
      if (SIMULATE) {
        // Simulate real network delay (100ms)
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log(`[SIMULATION] Notification ${notificationId} processed for ${recipient}`);
      } else {
        // Real Send via Resend
        const { error } = await resend.emails.send({
          from: 'FlashNotify <notifications@resend.dev>',
          to: recipient,
          subject: subject,
          html: `<p>${content}</p>`,
        });
        if (error) throw new Error(error.message);
      }

      // Update DB status to SENT
      await Notification.findByIdAndUpdate(notificationId, { status: 'SENT' });
      
    } catch (error: any) {
      console.error(`❌ Job ${job.id} failed:`, error.message);
      await Notification.findByIdAndUpdate(notificationId, { status: 'FAILED' });
      throw error; 
    }
  }, {
    connection: redisConnection,
    concurrency: 50, 
  });

  return worker;
};
