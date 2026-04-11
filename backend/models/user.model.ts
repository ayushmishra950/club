
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  fatherName: string;
  motherName: string;
  email: string;
  phone: string;
  dob: Date;
  gender: "male" | "female" | "other";
  maritalStatus: "single" | "married";
  occupation: string;
  role: "user" | "secretary" | "treasurer";
  blocked: boolean;
  address: string;
  profileImage: string;
  coverImage: string;
  donationsCount: number;
  donations: mongoose.Types.ObjectId[];
  totalDonated: number;
  city: string;
  state: string;
  password: string;
  isVerified: boolean;
  skills?: string[];
  hobbies?: string[];
  friends?:mongoose.Types.ObjectId[];
  type:"public" | "private" ;
  isOnline:boolean;
  lastSeen: string;

  accountType: "user" | "business";

  businessName?: string;
  businessCoverImage?: string;
  businessCategory?: string;
  businessDescription?: string;
  website?: string;
  businessVerified:boolean | null;
  businessPhone?: string;
  businessAddress?: string;
  workingHours?: string;

  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    fatherName: {
      type: String,
      required: false,       
      trim: true,
    },

    motherName: {
      type: String,
      required: false,    
      trim: true,
    },

    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default:[] }],

    role: {
      type: String,
      enum: ["user", "secretary", "treasurer"],
      default: "user",
    },

    blocked: {
      type: Boolean,
      default: false,
    },

    profileImage: {
      type: String,
      default: "https://imgs.search.brave.com/jZRu1Bg_0aa2nFmLdLrYbySoJg6ePZzvVdlNw5_1GQE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdC5k/ZXBvc2l0cGhvdG9z/LmNvbS82MjYyODc4/MC81NTIxOC9pLzQ1/MC9kZXBvc2l0cGhv/dG9zXzU1MjE4OTA0/Mi1zdG9jay1waG90/by13b3VsZC15b3Ut/bGlrZS10by1qb2lu/LmpwZw",
    },

    coverImage: {
      type: String,
      default: "https://imgs.search.brave.com/qtVnhSH_3K-y6lNVrGFLKW9Npve7PVGkR7tWDauD_gk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTM4/Njc5NjEzNi92ZWN0/b3IvbWlycm9yLWJh/bGwtZGlzY28tbGln/aHRzLWNsdWItZGFu/Y2UtcGFydHktZ2xp/dHRlci0zZC1pbGx1/c3RyYXRpb24uanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPW10/ZERKMmVrbjJwcFpB/dmVBQXU1NlNvc0RC/czBpWUpKVWlsWUNE/bkE3YU09",
    },

    skills: {
      type: [String],
      default: [],
    },

    hobbies: {
      type: [String],
      default: [],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    dob: {
      type: Date,
      required: false,    
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: false,
    },

    maritalStatus: {
      type: String,
      enum: ["single", "married"],
      required: false,
    },

    occupation: {
      type: String,
      required: false,      
      trim: true,
    },

    address: {
      type: String,
      required: false,   
      trim: true,
    },

    city: {
      type: String,
      required: false,
      trim: true,
    },

    state: {
      type: String,
      required: false,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,     
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    donationsCount: {
      type: Number,
      default: 0,
    },

    donations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
    }],

    totalDonated: {
      type: Number,
      default: 0,
    },


    accountType: {
      type: String,
      enum: ["user", "business"],
      required: true,
      default: "user",
    },

    type:{
     type:String,
     enum:["public", "private"],
     required:true,
     default:"public",
    },

    businessVerified:{
    type:Boolean,
    default:null,
    },

    businessName: {
      type: String,
      trim: true,
    },
    businessCoverImage:{
      type:String,
      default:"https://imgs.search.brave.com/qtVnhSH_3K-y6lNVrGFLKW9Npve7PVGkR7tWDauD_gk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTM4/Njc5NjEzNi92ZWN0/b3IvbWlycm9yLWJh/bGwtZGlzY28tbGln/aHRzLWNsdWItZGFu/Y2UtcGFydHktZ2xp/dHRlci0zZC1pbGx1/c3RyYXRpb24uanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPW10/ZERKMmVrbjJwcFpB/dm"
    },
    businessCategory: {
      type: String,
      trim: true,
    },
    businessDescription: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    businessPhone: {
      type: String,
      trim: true,
    },
    businessAddress: {
      type: String,
      trim: true,
    },
    workingHours: {
      type: String,
      trim: true,
    },

    isOnline:{
      type:Boolean,
      default:false,
      required:true
    },
    lastSeen:{
      type:String,
      default:null,
      required:true
    }

  },
  {
    timestamps: true,
  }
);


UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};


UserSchema.pre("save", function (next) {
  if (this.accountType === "business" && !this.businessName) {
    return new Error("Business name is required when accountType is business");
  }
});

const User = mongoose.model<IUser>("User", UserSchema);

export default User;