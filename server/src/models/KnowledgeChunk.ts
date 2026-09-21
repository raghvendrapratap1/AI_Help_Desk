import mongoose, { Schema, Document } from 'mongoose';

export interface IKnowledgeChunk extends Document {
  clinicId: mongoose.Types.ObjectId;
  title: string;
  category: 'treatment' | 'doctor' | 'pricing' | 'timing' | 'location' | 'general';
  content: string;
  embedding: number[];
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeChunkSchema = new Schema<IKnowledgeChunk>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true, index: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['treatment', 'doctor', 'pricing', 'timing', 'location', 'general'],
      default: 'general'
    },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true }
  },
  { timestamps: true }
);

KnowledgeChunkSchema.index({ clinicId: 1, category: 1 });

export const KnowledgeChunk = mongoose.model<IKnowledgeChunk>('KnowledgeChunk', KnowledgeChunkSchema);
