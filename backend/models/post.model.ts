import mongoose, { Schema, Document } from "mongoose";

export interface IComment {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  likes: mongoose.Types.ObjectId[]; // users who liked the comment
  replies: IComment[]; // nested replies
}

export interface IPost extends Document {
  title: string;
  description: string;
  images: string[]; // multiple images support
  createdBy: mongoose.Types.ObjectId;
  create: string;
  type: string;

  likes: mongoose.Types.ObjectId[]; // users who liked
  comments: IComment[];

  createdAt: Date;
  updatedAt: Date;
  important: boolean;
  notes: string;
  isPinned: boolean;
}

const commentSchema = new Schema<IComment>({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  replies: [], // ✅ recursive schema
});

commentSchema.add({
  replies: [commentSchema],
});

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      default: ""
    },

    images: [
      {
        type: String,
      },
    ],


    type: {
      type: String,
      required: true,
    },

    createdBy: {
      type: mongoose.Types.ObjectId,
      required: true,
      refPath: "create",
    },
    create: {
      type: String,
      required: true,
      enum: ["User", "Admin"],
    },
    important: {
      type: Boolean,
      default: false
    },
    isPinned: {
      type: Boolean,
      default: false
    },

    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model<IPost>("Post", postSchema);

export default Post;