import mongoose, { Schema } from "mongoose";
const commentSchema = new Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    likes: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
    ],
    replies: [], // ✅ recursive schema
});
commentSchema.add({
    replies: [commentSchema],
});
const postSchema = new Schema({
    title: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    notes: {
        type: String,
        default: ""
    },
    images: [
        {
            type: String,
        },
    ],
    type: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        required: true,
        refPath: "create",
    },
    create: {
        type: String,
        required: true,
        enum: ["User", "Admin"],
    },
    important: {
        type: Boolean,
        default: false
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    likes: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
    ],
    comments: [commentSchema],
}, {
    timestamps: true,
});
const Post = mongoose.model("Post", postSchema);
export default Post;
//# sourceMappingURL=post.model.js.map