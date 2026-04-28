
// import mongoose, { Schema, Document } from "mongoose";
// import bcrypt from "bcryptjs";

// export interface IUser extends Document {
//   _id: mongoose.Types.ObjectId;
//   userId: string;
//   fullName: string;
//   fatherName: string;
//   motherName: string;
//   spouseName?: string;
//   spouseEmail?: string;
//   email: string;
//   phone: string;
//   dob: Date;
//   gender: "male" | "female" | "other";
//   maritalStatus: "single" | "married";
//   occupation: string;
//   role: "user" | "secretary" | "treasurer";
//   blocked: boolean;
//   address: string;
//   profileImage: string;
//   coverImage: string;
//   donationsCount: number;
//   donations: mongoose.Types.ObjectId[];
//   totalDonated: number;
//   city: string;
//   state: string;
//   password: string;
//   isVerified: boolean;
//   skills?: string[];
//   hobbies?: string[];
//   friends?: mongoose.Types.ObjectId[];
//   type: "public" | "private";
//   isOnline: boolean;
//   lastSeen: string;

//   accountType: "user" | "business";

//   businessName?: string;
//   businessCoverImage?: string;
//   businessCategory?: string;
//   businessDescription?: string;
//   website?: string;
//   businessVerified: boolean | null;
//   businessPhone?: string;
//   businessAddress?: string;
//   workingHours?: string;
//   paymentImage?: string;
//   amount?: string;
//   transitionNumber?: string;
//   premiumUser?: null | "premium";


//   comparePassword(password: string): Promise<boolean>;
// }


// const UserSchema = new Schema<IUser>(
//   {
//     fullName: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     userId: {
//       type: String,
//       trim: true,
//       unique: true,
//     },

//     fatherName: {
//       type: String,
//       trim: true,
//     },

//     motherName: {
//       type: String,
//       trim: true,
//     },
//     spouseName: {
//       type: String,
//       trim: true,
//     },
//     spouseEmail: {
//       type: String,
//       trim: true,
//     },
//     paymentImage: {
//       type: String,
//       default: null,
//     },
//     transitionNumber: {
//       type: String,
//       default: null,
//     },
//     amount: {
//       type: String,
//       default: null,
//     },
//     premiumUser: {
//       type: String,
//       enum: [null, "premium"],
//       default: null,
//     },

//     friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],

//     role: {
//       type: String,
//       enum: ["user", "secretary", "treasurer"],
//       default: "user",
//     },

//     blocked: {
//       type: Boolean,
//       default: false,
//     },

//     profileImage: {
//       type: String,
//       default: "https://imgs.search.brave.com/jZRu1Bg_0aa2nFmLdLrYbySoJg6ePZzvVdlNw5_1GQE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdC5k/ZXBvc2l0cGhvdG9z/LmNvbS82MjYyODc4/MC81NTIxOC9pLzQ1/MC9kZXBvc2l0cGhv/dG9zXzU1MjE4OTA0/Mi1zdG9jay1waG90/by13b3VsZC15b3Ut/bGlrZS10by1qb2lu/LmpwZw",
//     },

//     coverImage: {
//       type: String,
//       default: "https://imgs.search.brave.com/qtVnhSH_3K-y6lNVrGFLKW9Npve7PVGkR7tWDauD_gk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTM4/Njc5NjEzNi92ZWN0/b3IvbWlycm9yLWJh/bGwtZGlzY28tbGln/aHRzLWNsdWItZGFu/Y2UtcGFydHktZ2xp/dHRlci0zZC1pbGx1/c3RyYXRpb24uanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPW10/ZERKMmVrbjJwcFpB/dmVBQXU1NlNvc0RC/czBpWUpKVWlsWUNE/bkE3YU09",
//     },

//     skills: {
//       type: [String],
//       default: [],
//     },

//     hobbies: {
//       type: [String],
//       default: [],
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },

//     phone: {
//       type: String,
//       // unique: true,
//       trim: true,
//       sparse: true,
//     },

//     dob: {
//       type: Date,
//       required: false,
//     },
//     gender: {
//       type: String,
//       enum: ["male", "female", "other"],
//       required: false,
//     },

//     maritalStatus: {
//       type: String,
//       enum: ["single", "married"],
//       required: false,
//     },

//     occupation: {
//       type: String,
//       required: false,
//       trim: true,
//     },

//     address: {
//       type: String,
//       required: false,
//       trim: true,
//     },

//     city: {
//       type: String,
//       required: false,
//       trim: true,
//     },

//     state: {
//       type: String,
//       required: false,
//       trim: true,
//     },

//     password: {
//       type: String,
//       required: true,
//       minlength: 6,
//       select: false,
//     },

//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
//     donationsCount: {
//       type: Number,
//       default: 0,
//     },

//     donations: [{
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Donation",
//     }],

//     totalDonated: {
//       type: Number,
//       default: 0,
//     },


//     accountType: {
//       type: String,
//       enum: ["user", "business"],
//       required: true,
//       default: "user",
//     },

//     type: {
//       type: String,
//       enum: ["public", "private"],
//       required: true,
//       default: "public",
//     },

//     businessVerified: {
//       type: Boolean,
//       default: null,
//     },

//     businessName: {
//       type: String,
//       trim: true,
//     },
//     businessCoverImage: {
//       type: String,
//       default: "https://imgs.search.brave.com/qtVnhSH_3K-y6lNVrGFLKW9Npve7PVGkR7tWDauD_gk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTM4/Njc5NjEzNi92ZWN0/b3IvbWlycm9yLWJh/bGwtZGlzY28tbGln/aHRzLWNsdWItZGFu/Y2UtcGFydHktZ2xp/dHRlci0zZC1pbGx1/c3RyYXRpb24uanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPW10/ZERKMmVrbjJwcFpB/dm"
//     },
//     businessCategory: {
//       type: String,
//       trim: true,
//     },
//     businessDescription: {
//       type: String,
//       trim: true,
//     },
//     website: {
//       type: String,
//       trim: true,
//     },
//     businessPhone: {
//       type: String,
//       trim: true,
//     },
//     businessAddress: {
//       type: String,
//       trim: true,
//     },
//     workingHours: {
//       type: String,
//       trim: true,
//     },

//     isOnline: {
//       type: Boolean,
//       default: false,
//     },
//     lastSeen: {
//       type: String,
//       default: null,
//     }

//   },
//   {
//     timestamps: true,
//   }
// );


// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return;

//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });


// UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
//   return bcrypt.compare(password, this.password);
// };


// UserSchema.pre("save", function (next) {
//   if (this.accountType === "business" && !this.businessName) {
//     return new Error("Business name is required when accountType is business");
//   }
// });

// const User = mongoose.model<IUser>("User", UserSchema);

// export default User;






























import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

/* ---------------- BUSINESS SUB SCHEMA ---------------- */
const BusinessSchema = new Schema(
  {
    businessId: { type: String, unique: true, sparse: true },
    businessName: { type: String, trim: true },
    businessCategory: { type: String, trim: true },
    businessDescription: { type: String, trim: true },
    website: { type: String, trim: true },
    businessPhone: { type: String, trim: true },
    businessAddress: { type: String, trim: true },
    workingHours: { type: String, trim: true },
    businessCoverImage: {
      type: String,
      default: ""
    },
    isVerified: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    }
  },
  { _id: true }
);

/* ---------------- USER INTERFACE ---------------- */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;

  userId: string;

  fullName: string;
  fatherName: string;
  motherName: string;
  spouseName?: string;
  spouseEmail?: string;

  email: string;
  phone: string;

  dob: Date;
  gender: "male" | "female" | "other";
  maritalStatus: "single" | "married";

  occupation: string;

  role: "user" | "secretary" | "treasurer";

  blocked: boolean;

  address: string;
  city: string;
  state: string;

  profileImage: string;
  coverImage: string;

  skills?: string[];
  hobbies?: string[];

  friends?: mongoose.Types.ObjectId[];

  password: string;

  isVerified: boolean;

  type: "public" | "private";

  isOnline: boolean;
  lastSeen: string;

  accountType: "user" | "business";

  /* ---------------- BUSINESS ARRAY ---------------- */
  businesses: {
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
  }[];

  paymentImage?: string;
  amount?: string;
  transitionNumber?: string;
  premiumUser?: null | "premium";

  comparePassword(password: string): Promise<boolean>;
}

/* ---------------- USER SCHEMA ---------------- */
const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },

    userId: { type: String, unique: true, trim: true },

    fatherName: String,
    motherName: String,
    spouseName: String,
    spouseEmail: String,

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    phone: { type: String, trim: true, sparse: true },

    dob: Date,

    gender: {
      type: String,
      enum: ["male", "female", "other"]
    },

    maritalStatus: {
      type: String,
      enum: ["single", "married"]
    },

    occupation: String,

    role: {
      type: String,
      enum: ["user", "secretary", "treasurer"],
      default: "user"
    },

    blocked: { type: Boolean, default: false },

    address: String,
    city: String,
    state: String,

    profileImage: { type: String, default: "" },
    coverImage: { type: String, default: "" },

    skills: { type: [String], default: [] },
    hobbies: { type: [String], default: [] },

    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    password: { type: String, required: true, select: false, minlength: 6 },

    isVerified: { type: Boolean, default: false },

    accountType: {
      type: String,
      enum: ["user", "business"],
      default: "user"
    },

    type: {
      type: String,
      enum: ["public", "private"],
      default: "public"
    },

    isOnline: { type: Boolean, default: false },
    lastSeen: { type: String, default: null },

    /* ---------------- BUSINESS ARRAY (MAIN FIX) ---------------- */
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
  {
    timestamps: true
  }
);

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

const User = mongoose.model<IUser>("User", UserSchema);

export default User;