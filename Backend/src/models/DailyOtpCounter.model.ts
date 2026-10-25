import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyOtpCounter extends Document {
  date: string; // YYYY-MM-DD
  counter: number;
}

const dailyOtpCounterSchema = new Schema<IDailyOtpCounter>(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    counter: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: false }
);

const DailyOtpCounter = mongoose.model<IDailyOtpCounter>('DailyOtpCounter', dailyOtpCounterSchema);

export default DailyOtpCounter;
