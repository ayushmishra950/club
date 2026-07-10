import mongoose, { Schema } from "mongoose";
const FriendRequestSchema = new Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
    },
    statusSeen: {
        type: String,
        enum: ['sent', 'delivered', 'seen'],
        default: 'sent'
    }
}, { timestamps: true });
FriendRequestSchema.index({ from: 1, to: 1 }, { unique: true });
const FriendRequest = mongoose.model("FriendRequest", FriendRequestSchema);
export default FriendRequest;
