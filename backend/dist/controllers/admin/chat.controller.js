import Chat from "../../models/chat.model.js";
import Message from "../../models/message.model.js";
import { getIO } from "../../utils/socketHelper.js";
import Group from "../../models/group.model.js";
import uploadToCloudinary from "../../cloudinary/uploadToCloudinary.js";
export const handleSendGroupMessage = async (req, res) => {
    try {
        const { groupId, message, chatId } = req.body;
        const files = req.files;
        const io = getIO();
        if (!groupId) {
            return res.status(400).json({
                message: "groupId are required.",
            });
        }
        // -------------------------
        // 1. CHECK GROUP
        // -------------------------
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group Not Found." });
        }
        // -------------------------
        // 2. FIND OR CREATE CHAT
        // -------------------------
        let chat = await Chat.findOne({ groupId, isGroup: true });
        if (!chat) {
            chat = await Chat.create({ groupId, isGroup: true, lastMessage: null });
        }
        // -------------------------
        // 3. HANDLE IMAGES (single OR array)
        // -------------------------
        let uploadedImages = [];
        if (files?.image) {
            const images = Array.isArray(files.image)
                ? files.image
                : [files.image];
            uploadedImages = await Promise.all(images.map(async (file) => {
                const result = await uploadToCloudinary(file.buffer, file.mimetype, "gallery");
                return result;
            }));
        }
        // -------------------------
        // 4. VALIDATE MESSAGE TYPE
        // -------------------------
        const hasText = message && message.trim().length > 0;
        const hasImages = uploadedImages.length > 0;
        if (!hasText && !hasImages) {
            return res.status(400).json({
                message: "Message or image is required.",
            });
        }
        // -------------------------
        // 5. CREATE MESSAGE
        // -------------------------
        const newMessage = await Message.create({
            chatId: chat._id,
            sender: null,
            text: hasText ? message : "",
            images: hasImages ? uploadedImages : [],
            status: "sent",
        });
        // -------------------------
        // 6. UPDATE CHAT LAST MESSAGE (FIXED BSON ISSUE)
        // -------------------------
        chat.lastMessage = newMessage._id; // ✅ ALWAYS STORE MESSAGE ID
        chat.updatedAt = new Date();
        await chat.save();
        io.emit("messageRefresh", newMessage, chat.updatedAt);
        io.emit("messageAdminRefresh", {
            newMessage: newMessage,
            groupId: chat.groupId,
            chatId: chat._id,
            updatedAt: chat.updatedAt
        });
        // -------------------------
        // 7. RESPONSE
        // -------------------------
        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: newMessage,
            chatId: chat._id,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err?.message || "Server Error",
        });
    }
};
export const handleGetChatFromGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        if (!groupId) {
            return res.status(400).json({ message: "GroupId is required." });
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group Not Found." });
        }
        const chat = await Chat.findOne({ groupId, isGroup: true });
        if (!chat) {
            return res.status(404).json({ message: "Chat Not Found." });
        }
        const messages = await Message.find({ chatId: chat._id })
            .populate("sender", "fullName profileImage email")
            .populate("postId")
            .sort({ createdAt: 1 })
            .lean();
        return res.status(200).json({
            success: true,
            chatId: chat._id,
            messages,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err?.message || "Server Error",
        });
    }
};
//# sourceMappingURL=chat.controller.js.map