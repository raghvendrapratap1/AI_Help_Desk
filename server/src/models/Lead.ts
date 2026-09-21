import mongoose, { Schema, Document } from 'mongoose';

export interface ILeadNote {
  _id?: mongoose.Types.ObjectId;
  content: string;
  author: string;
  createdAt?: Date;
}

export interface ILead extends Document {
  clinicId: mongoose.Types.ObjectId;
  patientName: string;
  phone: string;
  email?: string;
  requirement: string;
  source: 'Google' | 'Instagram' | 'Facebook' | 'Website' | 'Referral' | 'Phone' | 'Walk-in' | 'WhatsApp';
  status: 'New' | 'Contacted' | 'Qualified' | 'Appointment Booked' | 'Converted' | 'Lost';
  leadScore: number;
  assignedTo?: string;
  notes: ILeadNote[];
  createdAt: Date;
  updatedAt: Date;
}

const LeadNoteSchema = new Schema<ILeadNote>(
  {
    content: { type: String, required: true },
    author: { type: String, default: 'System Admin' }
  },
  { timestamps: true }
);

const LeadSchema = new Schema<ILead>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    patientName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    requirement: { type: String, required: true },
    source: {
      type: String,
      enum: ['Google', 'Instagram', 'Facebook', 'Website', 'Referral', 'Phone', 'Walk-in', 'WhatsApp'],
      default: 'Phone'
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Appointment Booked', 'Converted', 'Lost'],
      default: 'New'
    },
    leadScore: { type: Number, default: 50 },
    assignedTo: { type: String, default: 'Reception Desk' },
    notes: [LeadNoteSchema]
  },
  { timestamps: true }
);

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);
