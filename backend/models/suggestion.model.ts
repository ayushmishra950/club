import mongoose, { Schema, Document } from "mongoose";

export interface ISuggestionReply {
  message: string;
  createdAt: Date;
}

export interface ISuggestion extends Document {
  description: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
  adminReply?: string;
  adminReplies?: ISuggestionReply[];
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
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },

    adminReply: {
      type: String,
      default: null,
    },

    adminReplies: {
      type: [
        {
          message: {
            type: String,
            required: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
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