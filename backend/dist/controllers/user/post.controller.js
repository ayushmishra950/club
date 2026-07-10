import Post from "../../models/post.model.js";
import mongoose from "mongoose";
import { createNotificationInternal } from "./notification.controller.js";
import { NotificationType } from "../../models/notification.model.js";
import User from "../../models/user.model.js";
import Chat from "../../models/chat.model.js";
import Message from "../../models/message.model.js";
import { getIO } from "../../utils/socketHelper.js";
import Block from "../../models/block.model.js";
// export const getAllPosts = async (req: Request, res: Response) => { 
//   try { 
//     const userId = req.params.userId;
//     if(!userId) return res.status(400).json({message:"userId is required."});
//     const posts = await Post.find()
//       .sort({ isPinned: -1, createdAt: -1 })
//       .populate({ path: "createdBy", select: "name email fullName profileImage occupation role isDeleted" })
//       .populate({ path: "comments.user", select: "fullName name profileImage"})
//       .populate({ path: "comments.replies.user", select: "fullName name profileImage" });
//     const validPosts = posts.filter( (post: any) => post.createdBy && !post.createdBy.isDeleted);
//     return res.status(200).json({ success: true, posts: validPosts});
//   } catch (err: any) {
//     return res.status(500).json({ success: false, message: err.message});
//   }
// };
export const getAllPosts = async (req, res) => {
    try {
        const userId = req.params.userId; // This is the 'fromId' / current user ID
        if (!userId)
            return res.status(400).json({ message: "userId is required." });
        // 1. Fetch all block records involving this user (both directions)
        const blockRecords = await Block.find({
            $or: [
                { blockerId: userId },
                { blockedId: userId }
            ]
        });
        // 2. Extract unique user IDs that should be hidden from the feed
        const restrictedUserIds = blockRecords.map(record => record.blockerId.toString() === userId.toString()
            ? record.blockedId
            : record.blockerId);
        // 3. Fetch posts, filtering out creators who are in the restricted list
        const posts = await Post.find({
            createdBy: { $nin: restrictedUserIds } // Excludes posts from blocked/blocking users
        })
            .sort({ isPinned: -1, createdAt: -1 })
            .populate({ path: "createdBy", select: "name email fullName profileImage occupation role isDeleted" })
            .populate({ path: "comments.user", select: "fullName name profileImage" })
            .populate({ path: "comments.replies.user", select: "fullName name profileImage" });
        // 4. Final filter to clean out posts from deleted accounts
        const validPosts = posts.filter((post) => post.createdBy && !post.createdBy.isDeleted);
        return res.status(200).json({ success: true, posts: validPosts });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const addPostNotes = async (req, res) => {
    try {
        const { userId, notes } = req.body;
        const io = getIO();
        if (!userId || !notes)
            return res.status(400).json({ message: "userId or notes is required." });
        const user = await User.findById(userId);
        if (!user)
            return res.status(404).json({ message: "user not found." });
        if (user?.isDeleted)
            return res.status(403).json({ message: "Account is scheduled for deletion." });
        const post = await Post.create({ notes: notes, createdBy: userId, create: "User", type: "public" });
        if (!post)
            return res.status(404).json({ message: "Post add Failed" });
        io.emit("postNote", post);
        res.status(201).json({ message: "Notes add successfully.", post });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// ✅ Like / Unlike Post (Toggle)
export const toggleLikePost = async (req, res) => {
    const { userId, postId } = req.body;
    if (!userId || !postId)
        return res.status(400).json({ message: "userId or postId not Found." });
    try {
        const user = await User.findById(userId);
        if (!user)
            return res.status(404).json({ message: "user not authorised." });
        if (user?.isDeleted)
            return res.status(403).json({ message: "Account is scheduled for deletion." });
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        const isLiked = post.likes.includes(userId);
        if (isLiked) {
            post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
        }
        else {
            post.likes.push(userId);
        }
        await post.save();
        if (post?.createdBy.toString() !== userId.toString()) {
            await createNotificationInternal(post?.createdBy, userId, NotificationType.LIKE, postId, `${user?.fullName} ${isLiked ? "UnLike" : "Like"} your post.`);
        }
        res.status(200).json({
            success: true,
            message: isLiked ? "Post unliked" : "Post liked",
            likes: post.likes.length,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
// ✅ Add Comment
export const addComment = async (req, res) => {
    try {
        const { postId, text, userId } = req.body;
        const user = await User.findById(userId);
        if (!user)
            return res.status(404).json({ message: "user not authorised." });
        if (user?.isDeleted)
            return res.status(403).json({ message: "Account is scheduled for deletion." });
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        const comment = { user: userId, text, createdAt: new Date() };
        post.comments.push(comment);
        await post.save();
        if (post?.createdBy.toString() !== userId.toString()) {
            await createNotificationInternal(post?.createdBy, userId, NotificationType.COMMENT, postId, `${user?.fullName} commented on your post: ${text?.slice(0, 50)}`);
        }
        res.status(200).json({ success: true, message: "Comment added", comments: post.comments, comment: comment });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
export const likeUnlikeComment = async (req, res) => {
    try {
        const { postId, commentId, userId } = req.body;
        const user = await User.findById(userId);
        if (!user)
            return res.status(404).json({ message: "user not found." });
        if (user?.isDeleted)
            return res.status(403).json({ message: "Account is scheduled for deletion." });
        const post = await Post.findById(postId);
        if (!post)
            return res.status(404).json({ success: false, message: "Post not found" });
        // Recursive function to find comment or reply
        const findComment = (comments) => {
            for (const c of comments) {
                if (c._id.toString() === commentId)
                    return c;
                const reply = findComment(c.replies);
                if (reply)
                    return reply;
            }
            return null;
        };
        const comment = findComment(post.comments);
        if (!comment)
            return res
                .status(404)
                .json({ success: false, message: "Comment not found" });
        // Toggle like
        const objectUserId = new mongoose.Types.ObjectId(userId);
        const index = comment.likes.findIndex((id) => id.equals(objectUserId));
        if (index === -1) {
            comment.likes.push(objectUserId);
        }
        else {
            comment.likes.splice(index, 1);
        }
        await post.save();
        return res.status(200).json({
            success: true,
            message: index === -1 ? "Comment liked" : "Comment unliked",
            likes: comment.likes,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const replyToComment = async (req, res) => {
    try {
        const { postId, commentId, userId, text } = req.body;
        const user = await User.findById(userId);
        if (!user)
            return res.status(404).json({ message: "user not found." });
        if (user?.isDeleted)
            return res.status(403).json({ message: "Account is scheduled for deletion." });
        const post = await Post.findById(postId);
        if (!post)
            return res.status(404).json({ success: false, message: "Post not found" });
        const findComment = (comments) => {
            for (const c of comments) {
                if (c._id.toString() === commentId)
                    return c;
                const reply = findComment(c.replies);
                if (reply)
                    return reply;
            }
            return null;
        };
        const parentComment = findComment(post.comments);
        if (!parentComment)
            return res.status(404).json({ success: false, message: "Comment not found" });
        const reply = { user: userId, text, createdAt: new Date(), likes: [], replies: [] };
        parentComment.replies.push(reply);
        await post.save();
        return res.status(200).json({ success: true, message: "Reply added", reply: reply, replies: parentComment.replies });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const sharePost = async (req, res) => {
    try {
        let { fromId, toId, postId, activeTab } = req.body;
        const io = getIO();
        if (!fromId || !toId || !postId)
            return res.status(400).json({ message: "fromId, toId, and postId are required." });
        const [fromUser, toUser] = await Promise.all([
            User.findById(fromId),
            User.findById(Array.isArray(toId) ? toId[0] : toId),
        ]);
        if (!fromUser)
            return res.status(404).json({ message: "Your account not found." });
        if (fromUser.isDeleted)
            return res.status(403).json({ message: "Your account is inactive." });
        if (!toUser)
            return res.status(404).json({ message: "Recipient not found." });
        if (toUser.isDeleted)
            return res.status(403).json({ message: "Recipient is inactive." });
        const receivers = Array.isArray(toId) ? toId : [toId];
        const createdMessages = [];
        // ================= SINGLE CHAT =================
        if (activeTab === "single") {
            for (const receiverId of receivers) {
                const chat = await Chat.findOne({
                    members: { $all: [fromId, receiverId] },
                });
                if (!chat)
                    continue;
                const message = await Message.create({
                    chatId: chat._id,
                    sender: fromId,
                    postId,
                    createdAt: new Date(),
                });
                const populatedMessage = await message.populate("postId");
                io.to(receiverId.toString()).emit("messageRefresh", populatedMessage);
                createdMessages.push(message);
            }
        }
        // ================= GROUP CHAT =================
        else if (activeTab === "group") {
            for (const chatId of receivers) {
                const chat = await Chat.findById(chatId);
                if (!chat || !chat.isGroup)
                    continue;
                const message = await Message.create({
                    chatId: chat._id,
                    sender: fromId,
                    postId,
                    createdAt: new Date(),
                });
                const populatedMessage = await message.populate([
                    { path: "postId" },
                    { path: "sender", select: "fullName profileImage email" },
                ]);
                io.emit("messageRefresh", populatedMessage);
                createdMessages.push(message);
            }
        }
        return res.status(200).json({ success: true, message: "Post shared successfully.", messages: createdMessages });
    }
    catch (err) {
        console.error("Share Post Error:", err.message);
        return res.status(500).json({ success: false, message: "Failed to share post.", error: err.message });
    }
};
export const deletePost = async (req, res) => {
    try {
        const { postId, userId } = req.body;
        const io = getIO();
        if (!postId || !userId)
            return res.status(400).json({ message: "postId or userId is required." });
        const user = await User.findById(userId);
        if (!user)
            return res.status(404).json({ message: "user not authorised." });
        if (user?.isDeleted)
            return res.status(403).json({ message: "Account is scheduled for deletion." });
        const post = await Post.findById(postId);
        if (!post)
            return res.status(404).json({ message: "Post not found." });
        if (post.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this post." });
        }
        await post.deleteOne();
        io.emit("postDeleted", { postId, userId });
        res.status(200).json({ message: "Post deleted successfully." });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
