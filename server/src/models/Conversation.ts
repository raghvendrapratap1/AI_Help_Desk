import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointmentDraft {
  patientName?: string;
  age?: number;
  phone?: string;
  patientEmail?: string;
  primaryComplaint?: string;
  preferredDate?: string;
  preferredTime?: string;
  doctorName?: string;
  status?: 'pending' | 'confirmed';
}

export interface IConversation extends Document {
  clinicId: mongoose.Types.ObjectId;
  leadId?: mongoose.Types.ObjectId;
  visitorId: string;
  patientName?: string;
  phone?: string;
  patientEmail?: string;
  age?: number;
  preferredDate?: string;
  preferredTime?: string;
  doctorName?: string;
  appointmentDraft?: IAppointmentDraft;
  status: 'active' | 'closed' | 'escalated';
  channel: 'web_chat' | 'phone' | 'whatsapp' | 'voice_call';
  intent: string;
  urgency: string;
  treatment?: string;
  leadScore: number;
  summary?: string;
  lastMessage?: string;
  needsHuman?: boolean;
  escalationReason?: string;
  recordingUrl?: string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    visitorId: { type: String, required: true },
    patientName: { type: String },
    phone: { type: String },
    patientEmail: { type: String },
    age: { type: Number },
    preferredDate: { type: String },
    preferredTime: { type: String },
    doctorName: { type: String },
    appointmentDraft: {
      patientName: { type: String },
      age: { type: Number },
      phone: { type: String },
      patientEmail: { type: String },
      primaryComplaint: { type: String },
      preferredDate: { type: String },
      preferredTime: { type: String },
      doctorName: { type: String },
      status: { type: String, enum: ['pending', 'confirmed'], default: 'pending' }
    },
    status: { type: String, enum: ['active', 'closed', 'escalated'], default: 'active' },
    channel: { type: String, enum: ['web_chat', 'phone', 'whatsapp', 'voice_call'], default: 'web_chat' },
    intent: { type: String, default: 'General Enquiry' },
    urgency: { type: String, default: 'Medium' },
    treatment: { type: String },
    leadScore: { type: Number, default: 20 },
    summary: { type: String, default: '' },
    lastMessage: { type: String, default: '' },
    needsHuman: { type: Boolean, default: false },
    escalationReason: { type: String, default: '' },
    recordingUrl: { type: String },
    duration: { type: Number }
  },
  { timestamps: true }
);

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
