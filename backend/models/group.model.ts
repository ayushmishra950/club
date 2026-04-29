import mongoose, { Schema, Document } from "mongoose";

export interface IGroup extends Document {
  title: string;
  description: string;
  images: string[];
  imagesType: string;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  location: string;
  createdBy: mongoose.Types.ObjectId;
}

const GroupSchema = new Schema<IGroup>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: String,
    },

    images: [
      {
        type: String,
      },
    ],

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  },
  {
    timestamps: true,
  }
);

const Group = mongoose.model<IGroup>("Group", GroupSchema);

export default Group;