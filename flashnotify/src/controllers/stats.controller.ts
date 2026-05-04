import { Request, Response } from 'express';
import Notification from '../models/Notification';

export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]);

    // Format the result into a clean object
    const result = stats.reduce((acc: any, curr: any) => {
      acc[curr.status] = curr.count;
      return acc;
    }, {});

    res.json({
      total: Object.values(result).reduce((a: any, b: any) => a + b, 0),
      breakdown: result,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to aggregate stats' });
  }
};
