import mongoose, { Schema, Document } from "mongoose";

export interface ISuggestion extends Document {
  description: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'seen' | 'approved' | 'rejected';
}

const suggestionSchema: Schema<ISuggestion> = new Schema(
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

    status: {
      type: String,
      enum: ['pending', 'seen', 'approved', 'rejected'],
      default: 'pending',
    },


  },
  {
    timestamps: true,
  }
);

export const Suggestion = mongoose.model<ISuggestion>(
  "Suggestion",
  suggestionSchema
);