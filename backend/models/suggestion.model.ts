import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  description: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const suggestionSchema: Schema<IMessage> = new Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

export const Suggestion = mongoose.model<IMessage>(
  "Suggestion",
  suggestionSchema
);