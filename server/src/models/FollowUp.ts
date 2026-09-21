import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowUp extends Document {
  clinicId: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'cancelled';
  channel: 'email' | 'call' | 'whatsapp';
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUp>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    scheduledFor: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'sent', 'cancelled'],
      default: 'pending'
    },
    channel: {
      type: String,
      enum: ['email', 'call', 'whatsapp'],
      default: 'email'
    }
  },
  { timestamps: true }
);

export const FollowUp = mongoose.model<IFollowUp>('FollowUp', FollowUpSchema);
