import mongoose, { Schema } from "mongoose";
const GroupInviteSchema = new Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true,
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "invitedByModel",
        required: true,
    },
    invitedByModel: {
        type: String,
        enum: ["User", "Admin"],
        required: true,
    },
    invitedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
    },
}, { timestamps: true });
export default mongoose.model("GroupInvite", GroupInviteSchema);
//# sourceMappingURL=GroupInviteSchema.js.map