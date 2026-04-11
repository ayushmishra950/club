import User from "../../models/user.model.js";
import FriendRequest from "../../models/friendRequest.model.js";
import type { Request, Response } from "express";
import { createNotificationInternal } from "./notification.controller.js";
import {NotificationType} from "../../models/notification.model.js";
import { getIO } from "../../utils/socketHelper.js";
import Chat from "../../models/chat.model.js";


export const getSuggestedUsers = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) return res.status(400).json({ message: "userId is required." });

    const currentUser = await User.findById(userId).select("+friends");
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const currentFriends = currentUser.friends?.map((f: any) => f.toString()) || [];

    const users = await User.find({ _id: { $ne: currentUser._id } }).select("+friends");

    const friendRequests = await FriendRequest.find({
      $or: [{ from: currentUser._id }, { to: currentUser._id }],
    });

    const requestMap: Record<string, any> = {};
    friendRequests.forEach((fr) => {
      const otherUserId = fr.from.toString() === userId ? fr.to.toString() : fr.from.toString();
      requestMap[otherUserId] = fr;
    });

    const suggestions: any[] = [];

    const now = new Date();
    const cooldownDays = 30;

    for (let u of users) {
      const userIdStr = u._id.toString();

      if (currentFriends.includes(userIdStr)) continue;

      const fr = requestMap[userIdStr];

      if (fr) {
        if (fr.status === "accepted" || fr.status === "pending") {
          continue;
        } else if (fr.status === "rejected") {
          const rejectedAt = fr.updatedAt || fr.createdAt;
          const diffDays = (now.getTime() - rejectedAt.getTime()) / (1000 * 60 * 60 * 24);

          if (diffDays < cooldownDays) {
            continue;
          }
        }
      }
      let score = 0;

      if (u.city && u.city === currentUser.city) score += 3;
      if (u.state && u.state === currentUser.state) score += 2;
      if (u.hobbies?.some((h: string) => currentUser.hobbies?.includes(h))) score += 2;
      if (u.skills?.some((s: string) => currentUser.skills?.includes(s))) score += 3;
      if (u.occupation && u.occupation === currentUser.occupation) score += 1;

      const userFriends = u.friends?.map((f: any) => f.toString()) || [];
      const mutualFriends = userFriends.filter((f: string) => currentFriends.includes(f));
      if (mutualFriends.length > 0) score += mutualFriends.length * 2;

      if (fr && fr.status === "rejected") {
        score = Math.max(1, score * 0.5);
      }
      if (score > 0) {
        suggestions.push({
          ...u.toObject(),
          score,
          mutualFriendsCount: mutualFriends.length,
          mutualFriends: mutualFriends.slice(0, 3),
        });
      }
    }

    suggestions.sort((a, b) => b.score - a.score);

    res.status(200).json(suggestions);
  } catch (err: any) {
    res.status(500).json({ message: err?.message });
  }
};



export const sendFriendRequest = async (req: Request, res: Response) => {
  const io = getIO();
  try {
    const { fromId, toId } = req.body;

    if (!fromId || !toId) return res.status(400).json({ message: "Both user IDs are required." });
    if (fromId === toId) return res.status(400).json({ message: "Cannot send request to yourself." });

    const [fromUser, toUser] = await Promise.all([
      User.findById(fromId),
      User.findById(toId)
    ]);

    if (!fromUser || !toUser) return res.status(404).json({ message: "User not found." });

    if (fromUser.friends?.includes(toUser._id)) {
      return res.status(400).json({ message: "You are already friends." });
    }

    const existingRequest = await FriendRequest.findOne({ from: fromId, to: toId });
    if (existingRequest) return res.status(400).json({ message: "Friend request already sent." });

    const request = await FriendRequest.create({ from: fromId, to: toId, statusSeen: "delivered" });
    await createNotificationInternal(fromId, toId, NotificationType.FRIEND_REQUEST, undefined, `${fromUser?.fullName} sent a friend request`);
    res.status(201).json({ message: "Friend request sent.", request });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};


export const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;

    const request = await FriendRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Friend request not found." });
    if (request.status !== "pending") return res.status(400).json({ message: `Cannot accept a ${request.status} request.` });

    request.status = "accepted";
    await request.save();

    await Promise.all([
      User.findByIdAndUpdate(request.from, { $addToSet: { friends: request.to } }),
      User.findByIdAndUpdate(request.to, { $addToSet: { friends: request.from } }),
    ]);

    const fromUser = await User.findById(request.to);
        await createNotificationInternal(request.from, request.to, NotificationType.FRIEND_ACCEPT, undefined, `${fromUser?.fullName} friend request accepted.`);

    res.status(200).json({ message: "Friend request accepted." });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};


// export const cancelFriendRequest = async (req: Request, res: Response) => {
//   try {
//     const { requestId } = req.params;

//     const request = await FriendRequest.findById(requestId);
//     if (!request) return res.status(404).json({ message: "Friend request not found." });

//     await Promise.all([
//       User.findByIdAndUpdate(request.from, { $pull: { friends: request.to } }),
//       User.findByIdAndUpdate(request.to, { $pull: { friends: request.from } }),
//     ]);

//     await FriendRequest.findByIdAndDelete(requestId);

//     const fromUser = await User.findById(request.to);

//     await createNotificationInternal(
//       request.from,
//       request.to,
//       NotificationType.FRIEND_CANCEL,
//       undefined,
//       `${fromUser?.fullName} cancelled the friend request`
//     );

//     res.status(200).json({ message: "Friend request cancelled." });
//   } catch (err: any) {
//     res.status(500).json({ message: err.message });
//   }
// };


export const cancelFriendRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;

    const request = await FriendRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Friend request not found." });

    // Remove each other from friends list
    await Promise.all([
      User.findByIdAndUpdate(request.from, { $pull: { friends: request.to } }),
      User.findByIdAndUpdate(request.to, { $pull: { friends: request.from } }),
    ]);

    // Delete the friend request
    await FriendRequest.findByIdAndDelete(requestId);

    // Delete chat between the two users if exists
    await Chat.findOneAndDelete({
      members: { $all: [request.from, request.to] }
    });

    // Notification to the sender
    const fromUser = await User.findById(request.to);

    await createNotificationInternal(
      request.from,
      request.to,
      NotificationType.FRIEND_CANCEL,
      undefined,
      `${fromUser?.fullName} cancelled the friend request`
    );

    res.status(200).json({ message: "Friend request cancelled and chat removed." });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getFromAnToPendingRequests = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "userId is required." });

    const requests = await FriendRequest.find({
      $or: [
        { from: userId, status: "pending" },
        { to: userId, status: "pending" },
      ],
    })
      .populate("from", "fullName profileImage occupation")
      .populate("to", "fullName profileImage occupation");

    const sentRequests = requests.filter(r => r.from._id.toString() === userId);
    const receivedRequests = requests.filter(r => r.to._id.toString() === userId);

    res.status(200).json({
      sent: sentRequests,
      received: receivedRequests,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getFriendUsers = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "userId is required." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "You are not logged in." });

    const friendsRequests = await FriendRequest.find({ from: user._id, status: "accepted" })
      .populate<{ to: any }>("to", "fullName profileImage");

    const friends = friendsRequests.map(fr => ({
      _id: fr.to._id,
      fullName: fr.to.fullName,
      profileImage: fr.to.profileImage,
      friendshipCreatedAt: fr.createdAt
    }));

    res.status(200).json({ friends });
  } catch (err: any) {
    res.status(500).json({ message: err?.message });
  }
};



export const getMutualFriends = async (req: Request, res: Response) => {
  try {
    const { userId, otherUserId } = req.body;

    if (!userId || !otherUserId) {
      return res.status(400).json({ message: "Both userId and otherUserId are required" });
    }

    const currentUser = await User.findById(userId).select("+friends");
    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }

    const otherUser = await User.findById(otherUserId).select("+friends");
    if (!otherUser) {
      return res.status(404).json({ message: "Other user not found" });
    }

    const currentFriends = currentUser.friends?.map((f: any) => f.toString()) || [];
    const otherFriends = otherUser.friends?.map((f: any) => f.toString()) || [];

    const mutualIds = otherFriends.filter((f: string) =>
      currentFriends.includes(f)
    );

    const mutualFriends = await User.find({
      _id: { $in: mutualIds }
    }).select("fullName profileImage");

    return res.status(200).json({
      mutualFriendsCount: mutualIds.length,
      mutualFriends
    });

  } catch (err: any) {
    res.status(500).json({ message: err?.message });
  }
};