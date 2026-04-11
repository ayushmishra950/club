import Group from "../../models/group.model.js";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import Chat from "../../models/chat.model.js";




// ========================
// Get All Groups
// ========================
export const getAllGroups = async (req: Request, res: Response) => {
  try {
    const groups = await Group.find().populate("members", "fullName email profileImage");
    return res.status(200).json({ groups });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Server Error" });
  }
};




// ========================
// Toggle Member in Group
// ========================
// export const toggleMember = async (req: Request, res: Response) => {
//   try {
//     const { groupId, userId } = req.body;

//     // ✅ Validate IDs
//     if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: "Invalid IDs" });
//     }

//     // ✅ Find group
//     const group = await Group.findById(groupId);
//     if (!group) return res.status(404).json({ message: "Group not found" });

//     // 🔄 Toggle logic
//     const userIndex = group.members.findIndex(id => id.toString() === userId);

//     let message = "";
//     if (userIndex !== -1) {
//       // User already in group → remove
//       group.members.splice(userIndex, 1);
//       message = "Member removed successfully";
//     } else {
//       // User not in group → add
//       group.members.push(userId);
//       message = "Member added successfully";
//     }

//     await group.save();

//     return res.status(200).json({ message, group });
//   } catch (err: any) {
//     console.error(err);
//     return res.status(500).json({ message: err.message || "Server Error" });
//   }
// };






export const toggleMember = async (req: Request, res: Response) => {
  try {
    const { groupId, userId } = req.body;

    // ✅ Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(groupId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const userIndex = group.members.findIndex(
      (id) => id.toString() === userId
    );

    let message = "";

    if (userIndex !== -1) {
      group.members.splice(userIndex, 1);
      message = "Member removed successfully";

      await Chat.findOneAndUpdate(
        { groupId },
        { $pull: { members: userId }, $set: { groupId: groupId },}
      );
    } else {
      group.members.push(userId);
      message = "Member added successfully";

      await Chat.findOneAndUpdate(
        { groupId },
        {$set: { groupId: groupId }, $addToSet: { members: userId }, isGroup: true},
        { upsert: true, new: true,});
      }

    await group.save();

    return res.status(200).json({
      message,
      group,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      message: err.message || "Server Error",
    });
  }
};