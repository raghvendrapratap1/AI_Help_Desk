import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor {
  name: string;
  title: string;
  specialty: string;
  experience: string;
}

export interface IStaffMember {
  name: string;
  role: string;
  treatments: string[];
}

export interface IClinic extends Document {
  name: string;
  slug?: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  operatingHours: string;
  plan?: 'Free' | 'Starter' | 'Growth' | 'Enterprise';
  subscriptionStatus?: 'active' | 'trial' | 'past_due' | 'canceled';
  doctors: IDoctor[];
  staff: IStaffMember[];
  services: string[];
  knowledgeBaseSnippet: string;
  createdAt: Date;
}

const StaffMemberSchema = new Schema<IStaffMember>({
  name: { type: String, required: true },
  role: { type: String, default: 'Dental Surgeon' },
  treatments: [{ type: String }]
});

const DoctorSchema = new Schema<IDoctor>({
  name: { type: String, required: true },
  title: { type: String, required: true },
  specialty: { type: String, required: true },
  experience: { type: String, required: true }
});

const ClinicSchema = new Schema<IClinic>(
  {
    name: { type: String, required: true },
    slug: { type: String, index: true },
    tagline: { type: String, default: 'Advanced Oral & Maxillofacial Care' },
    address: { type: String, required: true },
    city: { type: String, default: 'Indore' },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    operatingHours: { type: String, required: true },
    plan: { type: String, enum: ['Free', 'Starter', 'Growth', 'Enterprise'], default: 'Free' },
    subscriptionStatus: { type: String, enum: ['active', 'trial', 'past_due', 'canceled'], default: 'active' },
    doctors: [DoctorSchema],
    staff: [StaffMemberSchema],
    services: [{ type: String }],
    knowledgeBaseSnippet: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Clinic = mongoose.model<IClinic>('Clinic', ClinicSchema);
