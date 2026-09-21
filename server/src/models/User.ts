import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'clinic_admin' | 'doctor' | 'receptionist';
  clinicId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['clinic_admin', 'doctor', 'receptionist'], default: 'clinic_admin' },
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
