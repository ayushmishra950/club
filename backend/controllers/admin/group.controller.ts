import type { Request, Response } from "express";
import Group from "../../models/group.model.js";
import mongoose from "mongoose";
import uploadToCloudinary from "../../cloudinary/uploadToCloudinary.js";
import Message from "../../models/message.model.js";
import Chat from "../../models/chat.model.js";
import { getIO } from "../../utils/socketHelper.js";
import User from "../../models/user.model.js";

// ========================
// Create Group
// ========================

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { title, description, members, location, createdBy } = req.body;

    const files = (req as any).files?.media || [];
    const images: string[] = [];

    for (const file of files) {
      if (!file.buffer) continue;
      const url = await uploadToCloudinary(file.buffer, file.mimetype, "groups");
      images.push(url);
    }

    // 🔍 Check user exists or not
    const userExists = await User.findById(createdBy);

    if (!userExists) {
      return res.status(404).json({
        message: "Creator user not found",
      });
    }

    // ✅ Force creator into members array
    const finalMembers = [createdBy];

    const group = new Group({
      title,
      description,
      images,
      members: finalMembers,
      location,
      createdBy,
    });

    await group.save();

    const latestGroup = await group.populate([
      { path: "createdBy", select: "fullName email profileImage" },
      { path: "members", select: "fullName email profileImage" }
    ]);

    getIO().emit("newGroup", latestGroup);

    return res.status(201).json({
      message: "Group created successfully",
      group: latestGroup,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      message: err.message || "Server Error",
    });
  }
};
// ========================
// Get All Groups
// ========================
export const getGroups = async (req: Request, res: Response) => {
  try {
    const groups = await Group.find()
      .populate("members", "fullName email profileImage").populate("createdBy", "fullName email profileImage")
      .sort({ createdAt: -1 });

    const groupsWithMessages = await Promise.all(
      groups.map(async (group) => {
        const chat = await Chat.findOne({ groupId: group._id });

        let unreadMessages: any = [];

        if (chat) {
          unreadMessages = await Message.find({
            chatId: chat._id,
            status: { $ne: "seen" },
            sender: { $ne: null },
          }).sort({ createdAt: -1 });
        }

        return {
          ...group.toObject(),
          chatId: chat ? chat._id : null,
          unreadMessages,
          updatedAt: chat ? chat.updatedAt : group.updatedAt,
        };
      })
    );

    return res.status(200).json({ groups: groupsWithMessages });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Server Error" });
  }
};
// ========================
// Get Single Group
// ========================
export const getGroupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const groupId = id as string;

    if (!mongoose.Types.ObjectId.isValid(groupId))
      return res.status(400).json({ message: "Invalid Group ID" });

    const group = await Group.findById(groupId).populate("members", "fullName email profileImage");
    if (!group) return res.status(404).json({ message: "Group not found" });

    return res.status(200).json({ group });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Server Error" });
  }
};

// ========================
// Update Group
// ========================
export const updateGroup = async (req: Request, res: Response) => {
  try {
    const { id, title, description, members, location } = req.body;
    const groupId = id as string;
    const io = getIO();

    if (!mongoose.Types.ObjectId.isValid(groupId))
      return res.status(400).json({ message: "Invalid Group ID" });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Update basic fields
    group.title = title || group.title;
    group.description = description || group.description;
    group.location = location || group.location;
    if (members) group.members = members;

    // Handle new media files
    const files = (req as any).files?.media || [];
    for (const file of files) {
      if (!file.buffer) continue;
      const url = await uploadToCloudinary(file.buffer, file.mimetype, "groups");
      group.images.push(url);
    }

    await group.save();

    const populatedGroup = await group.populate([
      { path: "createdBy", select: "fullName email profileImage" },
      { path: "members", select: "fullName email profileImage" }
    ]);

    io.emit("updateGroupDetail", populatedGroup);
    return res.status(200).json({ message: "Group updated successfully", group: populatedGroup });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Server Error" });
  }
};

// ========================
// Delete Group
// ========================
export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const groupId = id as string;
    const io = getIO();

    if (!mongoose.Types.ObjectId.isValid(groupId))
      return res.status(400).json({ message: "Invalid Group ID" });

    const group = await Group.findByIdAndDelete(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    io.emit("deleteGroup", groupId);

    return res.status(200).json({ message: "Group deleted successfully" });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Server Error" });
  }
};

// ========================
// Add Member
// ========================

export const addMember = async (req: Request, res: Response) => {
  try {
    const { groupId, members } = req.body;
    const io = getIO();

    // ✅ validate groupId
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid Group ID" });
    }

    // ✅ validate members array
    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: "Members not found" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // existing members
    const existingMembers = group.members.map(m => m.toString());

    // filter only new members
    const newMembers = members.filter(
      (id: string) => !existingMembers.includes(id)
    );

    if (newMembers.length === 0) {
      return res.status(400).json({ message: "All users already in group" });
    }

    // ✅ add in group
    group.members.push(...newMembers);
    await group.save();

    // ✅ sync with chat (IMPORTANT)
    await Chat.findOneAndUpdate(
      { groupId },
      {
        $set: { groupId: groupId, isGroup: true },
        $addToSet: { members: { $each: newMembers } }
      },
      { upsert: true, new: true }
    );

    const updateGroup = await group.populate([
      { path: "createdBy", select: "fullName email profileImage" },
      { path: "members", select: "fullName email profileImage" }
    ]);

    // ✅ socket emit
    io.emit("addMembersToGroup", updateGroup);

    return res.status(200).json({
      message: "Members added successfully",
      added: newMembers,
      group: updateGroup
    });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      message: err.message || "Server Error"
    });
  }
};

// ========================
// Remove Member
// ========================
export const removeMember = async (req: Request, res: Response) => {
  try {
    const { groupId, userId } = req.body;
    const io = getIO();

    if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "Invalid IDs" });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.members = group.members.filter((id) => id.toString() !== userId);
    await group.save();

    // Update chat as well
    await Chat.findOneAndUpdate(
      { groupId },
      {
        $pull: { members: userId }
      },
      { upsert: true }
    );
    const updateGroup = await group.populate([
      { path: "createdBy", select: "fullName email profileImage" },
      { path: "members", select: "fullName email profileImage" }
    ]);

    io.emit("addMembersToGroup", updateGroup);

    return res.status(200).json({ message: "Member removed successfully", group: updateGroup });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Server Error" });
  }
};