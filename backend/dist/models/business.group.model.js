import mongoose, { Schema } from "mongoose";
const BusinessGroupSchema = new Schema({
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
    category: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ["public", "private"],
        default: "public"
    },
    location: {
        type: String,
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
}, {
    timestamps: true,
});
const BusinessGroup = mongoose.model("BusinessGroup", BusinessGroupSchema);
export default BusinessGroup;
