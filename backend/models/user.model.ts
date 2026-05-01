

import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

/* ---------------- CHILD INTERFACE ---------------- */
interface IChild {
  name: string;
  age: number;
}

/* ---------------- BUSINESS INTERFACE ---------------- */
interface IBusiness {
  _id?: mongoose.Types.ObjectId;
  businessId?: string;
  businessName?: string;
  businessCategory?: string;
  businessDescription?: string;
  website?: string;
  businessPhone?: string;
  businessAddress?: string;
  workingHours?: string;
  businessCoverImage?: string;
  isVerified: "pending" | "verified" | "rejected";
}

/* ---------------- USER INTERFACE ---------------- */
export interface IUser extends Document {
  userId: string;

  fullName: string;
  email: string;
  mobile?: string;
  dob?: Date;
  occupation?: string;

  wifeName?: string;
  wifeEmail?: string;
  wifeMobile?: string;
  wifeDob?: Date;
  wifeOccupation?: string;

  anniversaryDate?: Date;
  gender?:string;
  maritalStatus?:string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;

  children: IChild[];

  role: "user" | "secretary" | "treasurer";
  blocked: boolean;

  profileImage: string;
  coverImage: string;

  friends: mongoose.Types.ObjectId[];

  password: string;

  isVerified: boolean;

  isOnline: boolean;
  lastSeen: string | null;

  accountType: "user" | "business";

  businesses: IBusiness[];

  paymentImage?: string;
  amount?: string;
  transitionNumber?: string;
  premiumUser?: null | "premium";

  comparePassword(password: string): Promise<boolean>;
}

/* ---------------- CHILD SCHEMA ---------------- */
const ChildSchema = new Schema<IChild>(
  {
    name: { type: String, trim: true },
    age: { type: Number }
  },
  { _id: false }
);

/* ---------------- BUSINESS SCHEMA ---------------- */
const BusinessSchema = new Schema<IBusiness>(
  {
    businessId: { type: String, unique: true, sparse: true },
    businessName: { type: String, trim: true },
    businessCategory: { type: String, trim: true },
    businessDescription: { type: String, trim: true },
    website: { type: String, trim: true },
    businessPhone: { type: String, trim: true },
    businessAddress: { type: String, trim: true },
    workingHours: { type: String, trim: true },
    businessCoverImage: { type: String, default: "" },
    isVerified: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    }
  },
  { _id: true }
);

/* ---------------- USER SCHEMA (FLAT) ---------------- */
const UserSchema = new Schema<IUser>(
  {
    userId: { type: String, unique: true, trim: true, required: true },

    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobile: { type: String, trim: true },
    dob: Date,
    occupation: String,
    gender: String,
    maritalStatus: String,
    city: String,

    wifeName: { type: String, trim: true },
    wifeEmail: { type: String, trim: true },
    wifeMobile: { type: String, trim: true },
    wifeDob: Date,
    wifeOccupation: String,

    anniversaryDate: Date,

    address: String,
    state: String,
    country: String,

    children: {
      type: [ChildSchema],
      default: []
    },

    role: {
      type: String,
      enum: ["user", "secretary", "treasurer"],
      default: "user"
    },

    blocked: { type: Boolean, default: false },

    profileImage: { type: String, default: "" },
    coverImage: { type: String, default: "" },

    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    password: { type: String, required: true, select: false, minlength: 6 },

    isVerified: { type: Boolean, default: false },

    accountType: {
      type: String,
      enum: ["user", "business"],
      default: "user"
    },

    isOnline: { type: Boolean, default: false },
    lastSeen: { type: String, default: null },

    businesses: {
      type: [BusinessSchema],
      default: []
    },

    paymentImage: String,
    amount: String,
    transitionNumber: String,
    premiumUser: {
      type: String,
      enum: [null, "premium"],
      default: null
    }
  },
  { timestamps: true }
);

/* ---------------- INDEX ---------------- */
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ userId: 1 }, { unique: true });

/* ---------------- PASSWORD HASH ---------------- */
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* ---------------- PASSWORD CHECK ---------------- */
UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

/* ---------------- MODEL ---------------- */
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;