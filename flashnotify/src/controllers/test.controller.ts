import { Request, Response } from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const startStressTest = async (req: Request, res: Response) => {
  const { token } = req.body;
  const TOTAL_REQUESTS = 5000;
  const CONCURRENCY = 100;
  const API_URL = `http://localhost:${process.env.PORT || 3000}/api/notify`;

  if (!token) return res.status(400).json({ error: 'Token is required' });

  // Start the test in the background (don't wait for it to finish)
  res.json({ message: '🚀 15,000 Notification Test Started in background!' });

  console.log(`🚀 Triggering 15k test via Dashboard...`);

  for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENCY) {
    const batch: Promise<any>[] = [];
    for (let j = 0; j < CONCURRENCY && (i + j) < TOTAL_REQUESTS; j++) {
      batch.push(
        axios.post(API_URL, {
          recipient: `user${i + j}@example.com`,
          subject: 'UI Triggered Scale Test',
          content: 'This test was started directly from the Dashboard!'
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-idempotency-key': uuidv4()
          }
        }).catch(() => {})
      );
    }
    await Promise.all(batch);
  }
  console.log(`✅ UI Triggered Test Finished!`);
};
