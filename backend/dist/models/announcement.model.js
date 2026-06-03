import mongoose, { Schema } from "mongoose";
const AnnouncementSchema = new Schema({
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
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
    },
}, {
    timestamps: true,
});
const Announcement = mongoose.model("Announcement", AnnouncementSchema);
export default Announcement;
//# sourceMappingURL=announcement.model.js.map