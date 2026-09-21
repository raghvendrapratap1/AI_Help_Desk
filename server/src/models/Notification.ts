import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  clinicId: mongoose.Types.ObjectId;
  type: 'human_handoff' | 'lead_alert' | 'followup_due';
  conversationId?: mongoose.Types.ObjectId;
  leadId?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    type: {
      type: String,
      enum: ['human_handoff', 'lead_alert', 'followup_due'],
      required: true
    },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
