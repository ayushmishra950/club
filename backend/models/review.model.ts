import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  fullName: string;
  description: string;
  createdAt: Date;
}

const ReviewSchema: Schema<IReview> = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);

export default ReviewModel;