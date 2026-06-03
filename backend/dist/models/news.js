import mongoose, { Schema } from "mongoose";
const NewsSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: "Admin",
    }
}, {
    versionKey: false,
});
const NewsModel = mongoose.model("News", NewsSchema);
export default NewsModel;
//# sourceMappingURL=news.js.map