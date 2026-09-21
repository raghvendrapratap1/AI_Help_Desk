import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  clinicId: mongoose.Types.ObjectId;
  leadId?: mongoose.Types.ObjectId;
  patientName: string;
  phone: string;
  patientEmail?: string;
  doctorName: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  status: 'Requested' | 'Confirmed' | 'Rescheduled' | 'Cancelled' | 'Completed';
  notes?: string;
  calendarEventId?: string;
  confirmationToken?: string;
  confirmedAt?: Date;
  createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    patientName: { type: String, required: true },
    phone: { type: String, required: true },
    patientEmail: { type: String },
    doctorName: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['Requested', 'Confirmed', 'Rescheduled', 'Cancelled', 'Completed'],
      default: 'Requested'
    },
    notes: { type: String, default: '' },
    calendarEventId: { type: String },
    confirmationToken: { type: String, index: true },
    confirmedAt: { type: Date }
  },
  { timestamps: true }
);

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
