import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';
import { notificationQueue } from '../services/queue';
import { redisConnection } from '../config/redis';

export const sendNotification = async (req: AuthRequest, res: Response) => {
  const { recipient, subject, content } = req.body;
  const userId = req.userId;
  const idempotencyKey = (req as any).idempotencyKey;

  if (!recipient || !subject || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Create a notification record in DB (PENDING)
    const notification = await Notification.create({
      userId,
      recipient,
      subject,
      content,
      idempotencyKey,
      status: 'PENDING'
    });

    // 2. Add to BullMQ Queue
    await notificationQueue.add('sendEmail', {
      notificationId: notification._id,
      recipient,
      subject,
      content
    }, {
      jobId: notification._id.toString() // Use MongoDB ID as Job ID for tracking
    });

    // 3. Update status to QUEUED
    notification.status = 'QUEUED';
    await notification.save();

    const result = {
      message: 'Notification queued successfully (BullMQ)',
      notificationId: notification._id,
      status: 'QUEUED'
    };

    // 4. Cache response for Idempotency (TTL 24 hours)
    await redisConnection.set(
      `idempotency:${idempotencyKey}`,
      JSON.stringify(result),
      'EX',
      86400
    );

    return res.status(202).json(result);
  } catch (error: any) {
    console.error('Notification Error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Duplicate idempotency key' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};
