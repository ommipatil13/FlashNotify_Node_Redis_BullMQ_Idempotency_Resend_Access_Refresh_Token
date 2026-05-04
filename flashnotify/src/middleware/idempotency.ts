import { Request, Response, NextFunction } from 'express';
import { redisConnection } from '../config/redis';

/**
 * Middleware to check for duplicate requests using an idempotency key.
 * If the key exists in Redis, it returns the cached response.
 */
export const idempotencyCheck = async (req: Request, res: Response, next: NextFunction) => {
  const key = req.header('x-idempotency-key');

  if (!key) {
    return res.status(400).json({ error: 'Missing x-idempotency-key header' });
  }

  try {
    const cachedResponse = await redisConnection.get(`idempotency:${key}`);

    if (cachedResponse) {
      console.log(`♻️ Idempotent hit: ${key}`);
      return res.status(200).json(JSON.parse(cachedResponse));
    }

    // Attach key to request so we can save the response later
    (req as any).idempotencyKey = key;
    next();
  } catch (error) {
    console.error('Idempotency error:', error);
    next(); // Fallback to normal processing if Redis is down
  }
};
