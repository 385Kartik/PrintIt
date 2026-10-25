import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPrintOptions {
  printSide: 'single' | 'double';
  colorMode: 'bw' | 'color';
  paperSize: 'A4' | 'A3' | 'Letter';
  copies: number;
}

export interface IFileInfo {
  filename: string;
  originalName: string;
  s3Key: string;
  s3Url: string;
  size: number;
  mimeType: string;
  pages: number;
  printOptions?: IPrintOptions;
  cost?: number;
}

export interface IPrintRequest extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: Types.ObjectId;
  files: IFileInfo[];
  special_pages?: {
    certificatePage: number;
    indexPage: number;
    coverPage: number;
  };
  total_amount: number;
  tokens_used: number;
  amount_paid: number;
  payment_id?: string;
  order_id?: string;
  collection_pin?: string; // For college_pickup: day-based OTP (e.g. "252"). For home_delivery: random 4-digit PIN.
  delivery_type: 'college_pickup' | 'home_delivery';
  payment_status: 'pending' | 'completed' | 'failed';
  print_status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'printed' | 'delivered' | 'collected';
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const printOptionsSchema = new Schema<IPrintOptions>(
  {
    printSide: {
      type: String,
      enum: ['single', 'double'],
      default: 'single',
    },
    colorMode: {
      type: String,
      enum: ['bw', 'color'],
      default: 'bw',
    },
    paperSize: {
      type: String,
      enum: ['A4', 'A3', 'Letter'],
      default: 'A4',
    },
    copies: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const fileInfoSchema = new Schema<IFileInfo>(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    s3Key: {
      type: String,
      required: true,
    },
    s3Url: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    pages: {
      type: Number,
      required: true,
      default: 1,
    },
    printOptions: {
      type: printOptionsSchema,
    },
    cost: {
      type: Number,
    },
  },
  { _id: false }
);

const printRequestSchema = new Schema<IPrintRequest>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    files: {
      type: [fileInfoSchema],
      default: [],
    },
    special_pages: {
      certificatePage: { type: Number, default: 0, min: 0 },
      indexPage: { type: Number, default: 0, min: 0 },
      coverPage: { type: Number, default: 0, min: 0 },
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    tokens_used: {
      type: Number,
      default: 0,
      min: 0,
    },
    amount_paid: {
      type: Number,
      required: true,
      min: 0,
    },
    payment_id: {
      type: String,
    },
    order_id: {
      type: String,
    },
    collection_pin: {
      type: String,
    },
    delivery_type: {
      type: String,
      enum: ['college_pickup', 'home_delivery'],
      default: 'home_delivery',
    },
    payment_status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    print_status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled', 'printed', 'delivered', 'collected'],
      default: 'pending',
    },
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for better query performance
printRequestSchema.index({ user_id: 1 });
printRequestSchema.index({ payment_status: 1 });
printRequestSchema.index({ print_status: 1 });
printRequestSchema.index({ createdAt: -1 });
printRequestSchema.index({ collection_pin: 1 });
printRequestSchema.index({ delivery_type: 1 });

const PrintRequest = mongoose.model<IPrintRequest>('PrintRequest', printRequestSchema);

export default PrintRequest;
