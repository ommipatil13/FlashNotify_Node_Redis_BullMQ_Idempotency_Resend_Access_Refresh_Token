import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_URL = 'http://localhost:3000/api/notify';
const TOTAL_REQUESTS = 5000;
const CONCURRENCY = 100; // Send 100 at a time to avoid crashing the local OS network
const JWT_TOKEN = 'PASTE_YOUR_ACCESS_TOKEN_HERE'; 

async function startStressTest() {
  console.log(`🚀 Starting Stress Test: ${TOTAL_REQUESTS} notifications...`);
  const startTime = Date.now();

  for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENCY) {
    const batch: Promise<any>[] = [];
    for (let j = 0; j < CONCURRENCY && (i + j) < TOTAL_REQUESTS; j++) {
      batch.push(
        axios.post(API_URL, {
          recipient: `user${i + j}@example.com`,
          subject: 'Scaling Test',
          content: 'This is a high-scale notification test using BullMQ and Redis.'
        }, {
          headers: {
            'Authorization': `Bearer ${JWT_TOKEN}`,
            'x-idempotency-key': uuidv4()
          }
        }).catch(err => {
            // Silently catch errors to keep the loop going
        })
      );
    }
    
    await Promise.all(batch);
    if ((i + CONCURRENCY) % 1000 === 0) {
      console.log(`📡 Sent ${i + CONCURRENCY} requests...`);
    }
  }

  const duration = (Date.now() - startTime) / 1000;
  console.log(`✅ Finished sending ${TOTAL_REQUESTS} requests in ${duration}s`);
  console.log(`📊 Now check http://localhost:3000/api/stats to see the Aggregation!`);
}

if (JWT_TOKEN === 'PASTE_YOUR_ACCESS_TOKEN_HERE') {
    console.error('❌ ERROR: Please login first and paste your JWT_TOKEN in stress-test.ts');
} else {
    startStressTest();
}
