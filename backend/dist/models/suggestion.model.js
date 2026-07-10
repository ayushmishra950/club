import mongoose, { Schema } from "mongoose";
const suggestionSchema = new Schema({
    suggestion: {
        type: String,
        required: true,
        trim: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
    adminReply: {
        type: String,
        default: null,
    },
    adminReplies: {
        type: [
            {
                userId: {
                    type: String,
                    required: true,
                },
                message: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        default: [],
    },
    userUnreadCount: {
        type: Number,
        default: 0,
    },
    adminUnreadCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
export const Suggestion = mongoose.model("Suggestion", suggestionSchema);
