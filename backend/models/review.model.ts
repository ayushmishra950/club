import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  message: string;
  status: string;
  adminReply: string;
  createdAt: Date;
}

const ReviewSchema: Schema<IReview> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminReply: {
      type: String,
      default: "",
    },
  },
  {
    versionKey: false,
  }
);

const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);

export default ReviewModel;