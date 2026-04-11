import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId | null;
  text: string | null;
  seenBy: mongoose.Types.ObjectId[];
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
  postId?: mongoose.Types.ObjectId;
  status:"sent" | "delivered" | "seen";
}

const MessageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
      trim: true,
    },
    images: [
  {
    type: String,
  },
],
    postId:{
      type:mongoose.Types.ObjectId,
      ref:"Post"
    },
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    status: {
  type: String,
  enum: ['sent', 'delivered', 'seen'],
  default: 'sent'
}
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", MessageSchema);