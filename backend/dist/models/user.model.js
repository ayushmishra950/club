import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
/* ---------------- CHILD SCHEMA ---------------- */
const ChildSchema = new Schema({ name: { type: String, trim: true }, age: { type: Number } }, { _id: false });
/* ---------------- BUSINESS SCHEMA ---------------- */
const BusinessSchema = new Schema({
    businessId: { type: String, unique: true, sparse: true },
    businessName: { type: String, trim: true },
    businessCategory: { type: String, trim: true },
    businessDescription: { type: String, trim: true },
    website: { type: String, trim: true },
    businessPhone: { type: String, trim: true },
    businessAddress: { type: String, trim: true },
    workingHours: { type: String, trim: true },
    businessCoverImage: { type: String, default: "" },
    bannerPosition: { type: String, enum: ["center", "left", "right"], default: "center" },
    isVerified: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending"
    }
}, { _id: true });
/* ---------------- USER SCHEMA (FLAT) ---------------- */
const UserSchema = new Schema({
    userId: { type: String, unique: true, trim: true, required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    mobile: { type: String, trim: true },
    dob: Date,
    occupation: String,
    gender: String,
    maritalStatus: String,
    city: String,
    spouseName: { type: String, trim: true },
    spouseEmail: { type: String, trim: true },
    spouseMobile: { type: String, trim: true },
    spouseDob: Date,
    spouseOccupation: String,
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
    accountType: { type: String, enum: ["user", "business"], default: "user" },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: String, default: null },
    businesses: { type: [BusinessSchema], default: [] },
    paymentImage: String,
    amount: String,
    transitionNumber: String,
    refreshTokens: {
        type: [String],
        default: []
    },
    premiumUser: {
        type: String,
        enum: [null, "premium"],
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deleteStatus: {
        type: String,
        enum: ["active", "pending", "approved", "rejected", "cancelled"],
        default: "active"
    },
    deleteDate: {
        type: Date,
        default: null
    },
    deleteReason: {
        type: String,
        default: null
    },
    pushToken: String,
    googleId: { type: String, unique: true, sparse: true },
    facebookId: { type: String, unique: true, sparse: true }
}, { timestamps: true });
/* ---------------- INDEX ---------------- */
UserSchema.index({ email: 1 }, { unique: true, sparse: true, partialFilterExpression: { email: { $type: "string" } } });
UserSchema.index({ mobile: 1 }, { unique: true, sparse: true, partialFilterExpression: { mobile: { $exists: true } } });
UserSchema.index({ spouseEmail: 1 }, { unique: true, sparse: true, partialFilterExpression: { spouseEmail: { $type: "string" } } });
UserSchema.index({ spouseMobile: 1 }, { unique: true, sparse: true, partialFilterExpression: { spouseMobile: { $exists: true } } });
UserSchema.index({ userId: 1 }, { unique: true });
/* ---------------- PASSWORD HASH ---------------- */
UserSchema.pre("save", async function () {
    if (!this.isModified("password"))
        return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
UserSchema.pre("validate", function () {
    if (!this.email && !this.mobile) {
        throw Error("Either email or mobile is required.");
    }
});
/* ---------------- PASSWORD CHECK ---------------- */
UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};
/* ---------------- MODEL ---------------- */
const User = mongoose.model("User", UserSchema);
export default User;
