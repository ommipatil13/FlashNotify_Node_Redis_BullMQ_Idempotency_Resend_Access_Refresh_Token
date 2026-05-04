import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { authenticate } from './middleware/auth';
import { idempotencyCheck } from './middleware/idempotency';
import * as authController from './controllers/auth.controller';
import * as notifyController from './controllers/notification.controller';
import * as statsController from './controllers/stats.controller';
import * as testController from './controllers/test.controller';
import { initWorker } from './workers/notification.worker';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Initialize Worker
initWorker();

// Welcome Route (Dashboard)
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Auth Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/refresh', authController.refresh);

// Notification Routes (Protected + Idempotent)
app.post(
  '/api/notify',
  authenticate,
  idempotencyCheck,
  notifyController.sendNotification
);

// Stats Route (Aggregation)
app.get('/api/stats', statsController.getStats);

// Test Trigger Route
app.post('/api/test/start', testController.startStressTest);

// Health Check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.listen(PORT, () => {
  console.log(`🚀 FlashNotify Server running on port ${PORT}`);
});
