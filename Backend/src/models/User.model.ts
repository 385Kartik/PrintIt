import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  hashed_password?: string | null;
  temporary_otp?: string | null;
  otp_expiry?: Date | null;
  college?: string;
  tokens: number;
  uploaded_file_urls: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    hashed_password: {
      type: String,
      default: null,
    },
    temporary_otp: {
      type: String,
      default: null,
    },
    otp_expiry: {
      type: Date,
      default: null,
    },
    college: {
      type: String,
      default: 'Universal College of Engineering',
      trim: true,
    },
    tokens: {
      type: Number,
      default: 3,
      min: 0,
    },
    uploaded_file_urls: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });

const User = mongoose.model<IUser>('User', userSchema);

export default User;
