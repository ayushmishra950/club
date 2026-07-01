import Block from "../../models/block.model.js";
import { Request, Response } from "express";
import User from "../../models/user.model.js";
import {getIO} from "../../utils/socketHelper.js";
import Chat from "../../models/chat.model.js";
import mongoose from "mongoose";

export const getBlockedUsers = async(req:Request, res:Response) => {
    try{
        const {userId} = req.params;
        if(!userId)return res.status(400).json({message: "User ID is required", success: false});
        const blockedUsers = await Block.find({blockerId: userId}).populate("blockedId", "fullName email profileImage");
        res.status(200).json({ data: blockedUsers, success: true});
    }
    catch(err:any){
        res.status(500).json({message: err?.message || "Internal Server Error", error: err, success: false});
    }
};

export const unblockUser = async (req: Request, res: Response) => {
  try {
    const { toId, fromId } = req.body;
    const io = getIO();

    if (!toId || !fromId) {
      return res.status(400).json({ message: "toId and fromId are required." });
    }
    
    const user = await User.findById(toId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isDeleted) return res.status(403).json({ message: "Account is scheduled for deletion." });
   
    // Fetch the block record first to safely get the target chatId
    const blockData = await Block.findOne({ blockerId: fromId, blockedId: toId });
    
    // SAFETY FIX: Prevent crash if block record doesn't exist
    if (!blockData) {
      return res.status(404).json({ message: "Block record not found or already unblocked." });
    }

    const chat = await Chat.findById(blockData.chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
   
    // Update the chat's blocked array list
    if (chat.blockedMembers && chat.blockedMembers.includes(toId)) {
      chat.blockedMembers = chat.blockedMembers.filter((id: mongoose.Types.ObjectId) => !id.equals(toId));
      await chat.save();   
    } // ✅ FIX: Safely closed the chat logic block here

    // Remove the block record completely from the Block collection
    await Block.deleteOne({ blockerId: fromId, blockedId: toId });
   
    // Notify the user over web sockets
    io.to(fromId).emit("unblockUser", { chatId: blockData.chatId, userId: toId, user }); 
             
    return res.status(200).json({ message: "User unblocked in chat successfully." });
  } // ✅ FIX: Closed the try block cleanly
  catch (err: any) {
    return res.status(500).json({ message: err.message, success: false, error: err });
  }
};


