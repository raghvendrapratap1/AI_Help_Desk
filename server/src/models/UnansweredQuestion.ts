import mongoose, { Schema, Document } from 'mongoose';

export interface IUnansweredQuestion extends Document {
  clinicId: mongoose.Types.ObjectId;
  question: string;
  count: number;
  lastAskedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UnansweredQuestionSchema = new Schema<IUnansweredQuestion>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    question: { type: String, required: true },
    count: { type: Number, default: 1 },
    lastAskedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const UnansweredQuestion = mongoose.model<IUnansweredQuestion>(
  'UnansweredQuestion',
  UnansweredQuestionSchema
);
