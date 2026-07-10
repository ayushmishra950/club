import mongoose, { Schema } from "mongoose";
const MessageSchema = new Schema({
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
    postId: {
        type: mongoose.Types.ObjectId,
        ref: "Post"
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
}, { timestamps: true });
export default mongoose.model("Message", MessageSchema);
