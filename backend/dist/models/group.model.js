import mongoose, { Schema } from "mongoose";
const GroupSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: "",
        trim: true,
    },
    images: [
        {
            type: String,
        },
    ],
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
}, {
    timestamps: true,
});
const Group = mongoose.model("Group", GroupSchema);
export default Group;
//# sourceMappingURL=group.model.js.map