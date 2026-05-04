import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  recipient: string;
  subject: string;
  content: string;
  status: 'PENDING' | 'QUEUED' | 'SENT' | 'FAILED';
  idempotencyKey: string;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'QUEUED', 'SENT', 'FAILED'], default: 'PENDING' },
  idempotencyKey: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<INotification>('Notification', NotificationSchema);
