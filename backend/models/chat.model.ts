import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  members: mongoose.Types.ObjectId[];
  pendingMembers: mongoose.Types.ObjectId[];
  isGroup: boolean;
  lastMessage?: mongoose.Types.ObjectId | null;
  groupId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    pendingMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isGroup: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IChat>("Chat", ChatSchema);