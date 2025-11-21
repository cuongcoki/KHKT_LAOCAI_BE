import mongoose, { Schema, Document } from 'mongoose';

export interface IUpload extends Document {
  filename: string;
  original_name: string;
  file_path: string;
  file_type: 'pdf' | 'word' | 'zip' | 'image' | 'video';
  mimetype: string;
  size: number;
  uploaded_by: mongoose.Types.ObjectId;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

const UploadSchema = new Schema<IUpload>(
  {
    filename: {
      type: String,
      required: true,
    },
    original_name: {
      type: String,
      required: true,
    },
    file_path: {
      type: String,
      required: true,
    },
    file_type: {
      type: String,
      enum: ['pdf', 'word', 'zip', 'image', 'video'],
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploaded_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Index
UploadSchema.index({ uploaded_by: 1 });
UploadSchema.index({ file_type: 1 });
UploadSchema.index({ created_at: -1 });

export const Upload = mongoose.model<IUpload>('Upload', UploadSchema);
