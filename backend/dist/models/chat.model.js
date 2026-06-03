import mongoose, { Schema } from "mongoose";
const ChatSchema = new Schema({
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    ],
    pendingMembers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    isGroup: {
        type: Boolean,
        default: false,
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
    },
}, { timestamps: true });
export default mongoose.model("Chat", ChatSchema);
//# sourceMappingURL=chat.model.js.map