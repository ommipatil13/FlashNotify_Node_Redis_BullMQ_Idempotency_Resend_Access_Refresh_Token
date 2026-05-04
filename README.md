This project, FlashNotify, is a high-performance Distributed Notification Engine built to handle massive traffic spikes (like sending 15,000 notifications in seconds) without crashing the server.

Here is the breakdown of why this project is impressive:

1. The Problem it Solves
Most servers crash if they try to send 15,000 emails at once because each email takes 1-2 seconds. FlashNotify solves this by using a "Queue and Worker" architecture. The API accepts the request in milliseconds and "buffers" it in Redis, while background workers process the actual emails at their own speed.

2. The Core Features
Idempotency (Double-Send Protection): Uses Redis to ensure that even if a network error causes a retry, the same notification is never sent twice.
Massive Scaling: Uses BullMQ to manage a high-speed job queue. We configured it to process 50 notifications simultaneously (Concurrency), which is much faster than traditional sequential processing.
JWT Lifecycle: A secure authentication system with Access and Refresh tokens, allowing users to stay logged in securely.
Real-Time Analytics: Uses a MongoDB Aggregation Pipeline to calculate success/failure stats across thousands of logs instantly.
Premium Dashboard: A live monitoring UI that polls the server to show real-time progress bars and counters.

3. The Tech Stack
Node.js & TypeScript: For the core logic and type safety.
Redis (Upstash): The high-speed "Engine" for queueing and idempotency.
MongoDB Atlas: The permanent storage for user data and notification history.
BullMQ: The production-grade library that manages the complex logic of retries and background jobs.
Resend: The modern email delivery API.
