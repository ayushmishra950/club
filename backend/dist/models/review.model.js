import mongoose, { Schema } from "mongoose";
const ReviewSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    adminReply: {
        type: String,
        default: "",
    },
}, {
    versionKey: false,
});
const ReviewModel = mongoose.model("Review", ReviewSchema);
export default ReviewModel;
//# sourceMappingURL=review.model.js.map