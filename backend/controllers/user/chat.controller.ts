
import User from "../../models/user.model.js";
import FriendRequest from "../../models/friendRequest.model.js";
import Chat from "../../models/chat.model.js";
import Message from "../../models/message.model.js";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { getIO } from "../../utils/socketHelper.js";
import Group from "../../models/group.model.js";
import uploadToCloudinary from "../../cloudinary/uploadToCloudinary.js";

export const getChatUsers = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId || Array.isArray(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const chats = await Chat.find({
      $or: [
        { members: { $in: [userObjectId] } },
        { pendingMembers: { $in: [userObjectId] } }
      ]
    }).sort({ updatedAt: -1 }).populate([
      {
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "fullName profileImage isOnline lastSeen",
        },
      },
      {
        path: "groupId",
        select: "title description images members",
      },
    ]);

    const friendsData = await Promise.all(
      chats.map(async (chat) => {

        // 🔥 GROUP CHAT
        if (chat.isGroup && chat.groupId) {

          // ✅ GROUP POPULATE ADDED HERE
          const group = await Group.findById(chat.groupId)
            .populate("members", "fullName profileImage isOnline lastSeen")
            .select("name image members");

          return {
            chatId: chat._id,
            isGroup: true,
            group: chat.groupId,
            members: chat.members,
            pendingMembers: chat.pendingMembers,
            friend: null,
            lastMessage: chat.lastMessage || null,
            deliveredMessages: [],
            updatedAt: chat.updatedAt,
          };
        }

        // 🔥 SINGLE CHAT (UNCHANGED)
        const friendId = chat.members.find(
          (id: mongoose.Types.ObjectId) => !id.equals(userObjectId)
        );

        if (!friendId) return null;

        const friend = await User.findById(friendId).select(
          "fullName email profileImage isOnline lastSeen"
        );

        if (!friend) return null;

        const deliveredMessages = await Message.find({
          chatId: chat._id,
          status: "delivered",
        }).select("_id sender text createdAt status");

        return {
          chatId: chat._id,
          isGroup: false,
          friend,
          group: null,
          lastMessage: chat.lastMessage || null,
          deliveredMessages,
          updatedAt: chat.updatedAt,
        };
      })
    );

    const friends = friendsData.filter(Boolean);

    return res.status(200).json({ friends });

  } catch (err: any) {
    return res.status(500).json({ message: err?.message });
  }
};


export const createOrGetChat = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "Both user IDs are required." });
    }

    // Check existing chat
    let chat = await Chat.findOne({
      members: { $all: [senderId, receiverId], $size: 2 },
    });

    // If not exist → create new
    if (!chat) {
      chat = await Chat.create({
        members: [senderId, receiverId],
      });
    }

    res.status(200).json({ chat, message: "user add successfully from chat." });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};



// // ✅ 2. Send Message
// export const sendMessage = async (req: Request, res: Response) => {
//   try {
//     const { chatId, senderId, text } = req.body;
//     const io = getIO();
//     const files = (req as any).files;
//     const file = files?.image?.[0];


//     if (!chatId || !senderId || !text) {
//       return res.status(400).json({ message: "All fields are required." });
//     }

//     let imageUrl = null;
//     if(file && file?.buffer){
//       imageUrl = await uploadToCloudinary(file.buffer, file.mimetype, "gallery")
//     }

//     const message = await Message.create({
//       chatId,
//       sender: senderId,
//       text: text || null,
//       seenBy: [senderId],
//       status: "delivered",
//       images:[imageUrl]
//     });

//     // Update last message
//    const chat = await Chat.findByIdAndUpdate(chatId, {
//       lastMessage: message._id,
//     });

//       await message.populate("sender", "fullName profileImage");

//     io.emit("messageRefresh", message);
//     io.emit("messageAdminRefresh", {newMessage:message,groupId:chat?.groupId })



//     res.status(201).json({ message: "message sent successfully.", data: message });
//   } catch (err: any) {
//     res.status(500).json({ message: err.message });
//   }
// };



// ✅ 3. Get Messages of a Chat
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({ message: "chatId is required." });
    }

    const messages = await Message.find({ chatId })
      .populate("sender", "fullName profileImage").populate("postId")
      .sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};






export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { chatId, senderId, text } = req.body;
    const io = getIO();

    const files = (req as any).files;
    const file = files?.image?.[0];

    if (!chatId || !senderId) {
      return res.status(400).json({ message: "chatId and senderId are required." });
    }

    if (!text && !file) {
      return res.status(400).json({ message: "Message or media required." });
    }

    let imageUrl = null;

    if (file && file.buffer) {
      imageUrl = await uploadToCloudinary(file.buffer, file.mimetype, "gallery");
    }

    const message = await Message.create({
      chatId,
      sender: senderId,
      text: text || "",
      seenBy: [senderId],
      status: "delivered",
      images: imageUrl ? [imageUrl] : [],
    });

    await message.populate("sender", "fullName profileImage");

    const chat = await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id, updatedAt: new Date() }, { new: true });

    io.emit("messageRefresh", message, chat?.updatedAt);
    io.emit("messageAdminRefresh", { newMessage: message, groupId: chat?.groupId, chatId, updatedAt: chat?.updatedAt });

    return res.status(201).json({
      message: "message sent successfully.",
      data: message,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};



// ✅ 4. Get All Chats of User (Chat List - Instagram style)
export const getUserChats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId is required." });
    }

    const chats = await Chat.find({
      members: userId,
    })
      .populate("members", "fullName profileImage")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "fullName",
        },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({ chats });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};



// ✅ 5. Mark Messages as Seen
export const markAsSeen = async (req: Request, res: Response) => {
  try {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
      return res.status(400).json({ message: "chatId and userId required." });
    }

    await Message.updateMany(
      { chatId, seenBy: { $ne: userId } },
      { $addToSet: { seenBy: userId } }
    );

    res.status(200).json({ message: "Messages marked as seen." });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};


export const acceptGroupInvite = async (req: Request, res: Response) => {
  try {
    const { chatId, userId } = req.body;
    const io = getIO();

    if (!chatId || !userId) {
      return res.status(400).json({ message: "chatId and userId required." });
    }


    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });


    if (!chat.members.includes(userId)) { chat.members.push(userId); }

    chat.pendingMembers = (chat.pendingMembers || []).filter(
      (id: mongoose.Types.ObjectId) => !id.equals(userId)
    );

    await chat.save();

    if (chat.groupId) {
      const group = await Group.findByIdAndUpdate(chat.groupId, { $addToSet: { members: userId }, }, { new: true });
      if (group) {
        await group.populate([
          { path: "createdBy", select: "fullName email profileImage" },
          { path: "members", select: "fullName email profileImage" }
        ]);

        io.emit("groupInviteAccepted", { chatId, userId, group });
      }

    }

    return res.status(200).json({
      message: "Group invite accepted successfully.",
    });

  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};


export const rejectGroupInvite = async (req: Request, res: Response) => {
  try {
    const { chatId, userId } = req.body;

    const io = getIO();

    if (!chatId || !userId) {
      return res.status(400).json({ message: "chatId and userId required." });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.pendingMembers = chat.pendingMembers.filter((id: mongoose.Types.ObjectId) => !id.equals(userId));

    await chat.save();
    io.to(userId).emit("rejectGroupInvite", { chatId, userId });

    res.status(200).json({ message: "Group invite rejected successfully." });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};