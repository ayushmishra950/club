import Post from "../../models/post.model.js";
import type { Request, Response } from "express";
import type {IComment} from "../../models/post.model.js";
import mongoose from "mongoose";
import { createNotificationInternal } from "./notification.controller.js";
import {NotificationType} from "../../models/notification.model.js";
import User from "../../models/user.model.js";
import Chat from "../../models/chat.model.js";
import Message from "../../models/message.model.js";
import {getIO} from "../../utils/socketHelper.js";



export const addPostNotes = async(req:Request, res:Response) => {
  try{
     const {userId, notes } = req.body;
     if(!userId || !notes) return res.status(400).json({message:"userId or notes is required."});

     const post = await Post.create({notes: notes, createdBy:userId, create: "User", type:"public"});
     if(!post) return res.status(404).json({message:"Post add Failed"});

     res.status(201).json({message:"Notes add successfully."})
  }
  catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}



// ✅ Like / Unlike Post (Toggle)
export const toggleLikePost = async (req: Request, res: Response) => {
    const {userId, postId} = req.body;
    if(!userId || !postId) return res.status(400).json({message:"userId or postId not Found."});
  try {
    const user = await User.findById(userId);
    if(!user)return res.status(404).json({message:"user not authorised."})

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();
       if(post?.createdBy.toString() !== userId.toString()){
     await createNotificationInternal(post?.createdBy, userId, NotificationType.LIKE, postId, `${user?.fullName} ${isLiked? "UnLike": "Like" } your post.`); 
       }
    res.status(200).json({
      success: true,
      message: isLiked ? "Post unliked" : "Post liked",
      likes: post.likes.length,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};





// ✅ Add Comment
export const addComment = async (req: Request, res: Response) => {
  try {
    const {postId, text, userId } = req.body;
    
     const user = await User.findById(userId);
    if(!user)return res.status(404).json({message:"user not authorised."});

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = {
      user: userId,
      text,
      createdAt: new Date(),
    };

    post.comments.push(comment as any);

    await post.save();
     if(post?.createdBy.toString() !== userId.toString()){
         await createNotificationInternal(post?.createdBy, userId, NotificationType.COMMENT, postId,  `${user?.fullName} commented on your post: ${text?.slice(0, 50)}`);
     }
    res.status(200).json({
      success: true,
      message: "Comment added",
      comments: post.comments,
      comment:comment
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const likeUnlikeComment = async (req: Request, res: Response) => {
  try {
    const { postId, commentId, userId } = req.body;
    console.log(req.body)

    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    // Recursive function to find comment or reply
    const findComment = (comments: IComment[]): IComment | null => {
      for (const c of comments) {
        if (c._id.toString() === commentId) return c;

        const reply = findComment(c.replies);
        if (reply) return reply;
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
    } else {
      comment.likes.splice(index, 1);
    }

    await post.save();

    return res.status(200).json({
      success: true,
      message: index === -1 ? "Comment liked" : "Comment unliked",
      likes: comment.likes,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};





export const replyToComment = async (req: Request, res: Response) => {
  try {
    const { postId, commentId, userId, text } = req.body;

    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    const findComment = (comments: IComment[]): IComment | null => {
      for (const c of comments) {
        if (c._id.toString() === commentId) return c;
        const reply = findComment(c.replies);
        if (reply) return reply;
      }
      return null;
    };

    const parentComment = findComment(post.comments);
    if (!parentComment)
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });

    const reply = {
      user: userId,
      text,
      createdAt: new Date(),
      likes: [],
      replies: [],
    };

    parentComment.replies.push(reply as any);
    await post.save();

    return res.status(200).json({
      success: true,
      message: "Reply added",
      reply: reply,
      replies: parentComment.replies,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};



// export const sharePost = async (req: Request, res: Response) => {
//   try {
//     let { fromId, toId, postId, activeTab } = req.body;
//     const io = getIO();
//     // Validation
//     if (!fromId || !toId || !postId) {
//       return res.status(400).json({
//         message: "fromId, toId, and postId are required.",
//       });
//     }

//     // Ensure toId is always an array
//     if (!Array.isArray(toId)) {
//       toId = [toId];
//     }

//     const createdMessages = [];

//     for (const receiverId of toId) {
//       // Find or create chat between fromId and receiverId
//       let chat = await Chat.findOne({
//         members: { $all: [fromId, receiverId] },
//       });

//       if (!chat) {
//         return res.status(404).json({
//           message: `Chat not found between ${fromId} and ${receiverId}`,
//         });
//       }

//       const message = await Message.create({
//         chatId: chat._id,
//         sender: fromId,
//         postId: postId,
//         createdAt: new Date(),
//       });

//       const populatedMessage = await message.populate("postId");
//       io.to(receiverId.toString()).emit("messageRefresh", populatedMessage);
//       createdMessages.push(message);
//     }

//     res.status(200).json({
//       message: "Post shared successfully.",
//       messages: createdMessages,
//     });
//   } catch (err: any) {
//     console.error("Error sharing post:", err.message);
//     res.status(500).json({
//       message: "Failed to share post.",
//       error: err.message,
//     });
//   }
// };











export const sharePost = async (req: Request, res: Response) => {
  try {
    let { fromId, toId, postId, activeTab } = req.body;
    const io = getIO();

    if (!fromId || !toId || !postId) {
      return res.status(400).json({
        message: "fromId, toId, and postId are required.",
      });
    }

    // ensure array
    if (!Array.isArray(toId)) {
      toId = [toId];
    }

    const createdMessages = [];

    // -------------------------------
    // SINGLE CHAT FLOW (UNCHANGED)
    // -------------------------------
    if (activeTab === "single") {
      for (const receiverId of toId) {
        const chat = await Chat.findOne({
          members: { $all: [fromId, receiverId] },
        });

        if (!chat) {
          return res.status(404).json({
            message: `Chat not found between ${fromId} and ${receiverId}`,
          });
        }

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

    // -------------------------------
    // GROUP CHAT FLOW (NEW)
    // -------------------------------
    else if (activeTab === "group") {
      for (const chatId of toId) {
        const chat = await Chat.findById(chatId);

        if (!chat || !chat.isGroup) {
          return res.status(404).json({
            message: `Group chat not found for ${chatId}`,
          });
        }

        const message = await Message.create({
          chatId: chat._id,
          sender: fromId,
          postId,
          createdAt: new Date(),
        });

       const populatedMessage = await message.populate([
  { path: "postId" },
  { path: "sender", select: "fullName profileImage email" }
]);

        // emit to entire group room
        io.emit("messageRefresh", populatedMessage);

        createdMessages.push(message);
      }
    }

    return res.status(200).json({
      message: "Post shared successfully.",
      messages: createdMessages,
    });
  } catch (err: any) {
    console.error("Error sharing post:", err.message);
    return res.status(500).json({
      message: "Failed to share post.",
      error: err.message,
    });
  }
};