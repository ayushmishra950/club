import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  role: "super_admin" | "admin" | "editor";
  isActive: boolean;
  profileImage: string;
  comparePassword(password: string): Promise<boolean>;
  isOnline:boolean;
  lastSeen: string;
  mobile:string;
  clubName:string;
  foundedYear:string;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    mobile:{
      type:String,
      default:"9876543212"
    },

    clubName:{
      type:String,
      default:"xyz club"
    },

    foundedYear:{
      type:String,
      default:"2026"
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    role: {
      type: String,
      enum: ["super_admin", "admin"],
      default: "admin"
    },

    isActive: {
      type: Boolean,
      default: true
    },
    profileImage:{
      type:String,
      default:"https://imgs.search.brave.com/jZRu1Bg_0aa2nFmLdLrYbySoJg6ePZzvVdlNw5_1GQE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdC5k/ZXBvc2l0cGhvdG9z/LmNvbS82MjYyODc4/MC81NTIxOC9pLzQ1/MC9kZXBvc2l0cGhv/dG9zXzU1MjE4OTA0/Mi1zdG9jay1waG90/by13b3VsZC15b3Ut/bGlrZS10by1qb2lu/LmpwZw"
    },
    isOnline:{
      type:Boolean,
      default:false,
    },
    lastSeen:{
      type:String,
      default:null,
    }
  },
  {
    timestamps: true
  }
);


// 🔐 Password Hash Middleware
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return ;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

});


// 🔑 Password Compare Method
AdminSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;