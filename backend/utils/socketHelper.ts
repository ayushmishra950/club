

// import { Server as IOServer } from "socket.io";
// import { Server as HTTPServer } from "http";
// import User from "../models/user.model.js";
// import Message from "../models/message.model.js";
// import Chat from "../models/chat.model.js";
// import FriendRequest from "../models/friendRequest.model.js";
// import Notification, {NotificationType } from "../models/notification.model.js";


// const getUnreadCount = async (userId:string) => {
//   const chats = await Chat.find({ members: userId });
//   const chatIds = chats.map(c => c._id);

//   const count = await Message.countDocuments({
//     chatId: { $in: chatIds },
//     sender: { $ne: userId },
//     seenBy: { $ne: userId }
//   });

//   return count;
// };
// let io: IOServer;

// export const initSocket = (server: HTTPServer) => {
//   io = new IOServer(server, {
//     cors: {
//       origin: ["http://localhost:8080", "http://localhost:8081"],
//     },
//   });

//   // Track all online sockets for each user
//   let onlineUsers: { [userId: string]: string[] } = {};

//   io.on("connection", (socket) => {
//     console.log("✅ User connected with socket id:", socket.id);
//     socket.on("joinRoom", async (userId: string) => {
//       if (!userId) return;
//          socket.join(userId);
//          console.log(`User ${userId} joined room`);
//       if (!onlineUsers[userId]) onlineUsers[userId] = [];
//       onlineUsers[userId].push(socket.id);
    
//       await User.findByIdAndUpdate(userId, { isOnline: true });

  
//       socket.broadcast.emit("userOnline", userId);

   
//       socket.emit("onlineUsersList", Object.keys(onlineUsers));
//     });

//    socket.on("unSeenFriendRequest", async (data) => {
//   const { from, to } = data;
//   if (!from) return;

//   let receiverId = to;

//   if (!receiverId) {
//     const request = await FriendRequest.findOne({ from }).sort({ createdAt: -1 }); 
//     receiverId = request?.to;
//   }

//   const receiverCount = await FriendRequest.countDocuments({ to: receiverId, statusSeen: "delivered"});

//   if (receiverId) { io.to(receiverId).emit("unSeenFriendRequest", receiverCount)};
// });

//   socket.on("friendRequestSeen", async(userId) => {
//       if(!userId)return;
//       const friend = await FriendRequest.updateMany({ to:userId }, {statusSeen:"seen"});
//       io.to(userId).emit("friendRequestSeen");
//   });
//     socket.on("typingChat", () => {
//       io.emit("typingChat");
//     });

//  socket.on("getUnreadCount", async (userId) => {
//   const count = await getUnreadCount(userId);
//   io.to(userId).emit("totalUnReadChat", count);
// });

//  socket.on("markMessagesSeen", async (data = {}) => {
//   const { chatId, userId } = data;

//   if (!chatId || !userId) return; // invalid input ko ignore karo

//   const messages = await Message.find({
//     chatId,
//     sender: { $ne: userId },
//     status: { $ne: "seen" },
//   });

//   const messageIds = messages.map(m => m._id);

//   if (messageIds.length === 0) return;

//   // Update all messages as seen
//   await Message.updateMany(
//     { _id: { $in: messageIds } },
//     { $set: { status: "seen" }, $addToSet: { seenBy: userId } }
//   );

//    const msg = await Message.find({ chatId }).populate("postId").sort({ createdAt: 1 });
//   // Emit to senders
//   // messages.forEach(m => {
//   //   io.to(m.sender.toString()).emit( "messageSeen", msg);
//   // });
// });

// socket.on("messageSeen", async (data) => {
//   const { chatId, receiverUserId, senderUserId } = data;
//   console.log(data);
//   if (!chatId || !receiverUserId) return;

//   try {
 
//    const msg = await Message.updateMany( { chatId: chatId, sender: { $ne: receiverUserId } },
//       { $addToSet: { seenBy: receiverUserId }, $set: { status: "seen" } });
//     const messages = await Message.find({ chatId }).populate("sender").populate("postId").sort({ createdAt: 1 });
   
//     io.to(receiverUserId).emit("messageSeen", {chatId, messages});
//     io.to(senderUserId).emit("messageSeen", {chatId, messages});
//   } catch (error) {
//     console.log(error);
//   }
// });

// socket.on("notificationSeen", async (userId) => {
//   try {
//     if (!userId) return;
//     await Notification.updateMany( { receiver: userId, isRead: false }, { $set: { isRead: true } });

//     await Notification.updateMany( { type: "announcement", isRead: false },{ $set: { isRead: true } });
//     const notifications = await Notification.find({ $or: [ { receiver: userId }, { type: "announcement" }]})
//       .populate("sender", "fullName profileImage")
//       .populate("receiver", "fullName profileImage")
//       .sort({ createdAt: -1 });

//     io.to(userId).emit("notificationSeen", notifications);
//   } catch (error) {
//     console.error("notificationSeen error:", error);
//   }
// });

// socket.on("businessVerify", (userId) => {
//   if(!userId)return;
//   io.to(userId).emit("businessVerify");
// })

//   socket.on("disconnect", async () => {
 
//   const offlineUserId = Object.keys(onlineUsers).find((id) => {
//     const sockets = onlineUsers[id];
//     return sockets ? sockets.includes(socket.id) : false;
//   });

//   if (offlineUserId) {
//     const sockets = onlineUsers[offlineUserId];
//     if (sockets) {
//       onlineUsers[offlineUserId] = sockets.filter((id) => id !== socket.id);
//     }

  
//     if (!onlineUsers[offlineUserId] || onlineUsers[offlineUserId].length === 0) {
//       delete onlineUsers[offlineUserId];

    
//       await User.findByIdAndUpdate(offlineUserId, {
//         isOnline: false,
//         lastSeen: new Date().toISOString(),
//       });

//       // Notify others
//       socket.broadcast.emit("userOffline", offlineUserId);
//     }
//   }
// });

//   });

//   return io;
// };

// // Helper to get io instance elsewhere
// export function getIO() {
//   if (!io) throw new Error("socket not initialised.");
//   return io;
// }















import { Server as IOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import User from "../models/user.model.js";
import Admin from "../models/admin.model.js"; // ✅ NEW
import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import FriendRequest from "../models/friendRequest.model.js";
import Notification, { NotificationType } from "../models/notification.model.js";

const getUnreadCount = async (userId: string) => {
  const chats = await Chat.find({ members: userId });
  const chatIds = chats.map(c => c._id);

  const count = await Message.countDocuments({
    chatId: { $in: chatIds },
    sender: { $ne: userId },
    seenBy: { $ne: userId }
  });

  return count;
};

let io: IOServer;

export const initSocket = (server: HTTPServer) => {
  io = new IOServer(server, {
    cors: {
      origin: ["http://localhost:8080", "http://localhost:8081", "https://club-admin-bb8a.onrender.com", "https://club-frontend-user.onrender.com"],
    },
  });

  let onlineUsers: { [userId: string]: string[] } = {};

  io.on("connection", (socket) => {
    console.log("✅ User connected with socket id:", socket.id);

    // ================= JOIN =================
    socket.on("joinRoom", async (userId: string) => {
      if (!userId) return;

      socket.join(userId);
      console.log(`User/Admin ${userId} joined room`);

      if (!onlineUsers[userId]) onlineUsers[userId] = [];
      onlineUsers[userId].push(socket.id);

      // ✅ CHECK USER FIRST
      let user = await User.findById(userId);

      if (user) {
        await User.findByIdAndUpdate(userId, { isOnline: true });
      } else {
        // ✅ IF NOT USER → CHECK ADMIN
        const admin = await Admin.findById(userId);
        if (admin) {
          await Admin.findByIdAndUpdate(userId, { isOnline: true });
        }
      }

      socket.broadcast.emit("userOnline", userId);
      socket.emit("onlineUsersList", Object.keys(onlineUsers));
    });

    // ================= OTHER EVENTS (UNCHANGED) =================
    socket.on("unSeenFriendRequest", async (data) => {
      const { from, to } = data;
      if (!from) return;

      let receiverId = to;

      if (!receiverId) {
        const request = await FriendRequest.findOne({ from }).sort({ createdAt: -1 });
        receiverId = request?.to;
      }

      const receiverCount = await FriendRequest.countDocuments({
        to: receiverId,
        statusSeen: "delivered"
      });

      if (receiverId) {
        io.to(receiverId).emit("unSeenFriendRequest", receiverCount);
      }
    });

    socket.on("friendRequestSeen", async (userId) => {
      if (!userId) return;
      await FriendRequest.updateMany({ to: userId }, { statusSeen: "seen" });
      io.to(userId).emit("friendRequestSeen");
    });

    socket.on("typingChat", () => {
      io.emit("typingChat");
    });

    socket.on("event", () => {
      io.emit("event");
    });

    socket.on("interestedcandidateFromEvent", (obj)=>{
      io.emit("interestedcandidateFromEvent", obj);
    })

    socket.on("getUnreadCount", async (userId) => {
      const count = await getUnreadCount(userId);
      io.to(userId).emit("totalUnReadChat", count);
    });

    socket.on("markMessagesSeen", async (data = {}) => {
      const { chatId, userId } = data;
      if (!chatId || !userId) return;

      const messages = await Message.find({
        chatId,
        sender: { $ne: userId },
        status: { $ne: "seen" },
      });

      const messageIds = messages.map(m => m._id);
      if (messageIds.length === 0) return;

      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $set: { status: "seen" }, $addToSet: { seenBy: userId } }
      );
    });

    socket.on("messageSeen", async (data) => {
      const { chatId, receiverUserId, senderUserId } = data;
      if (!chatId || !receiverUserId) return;

      try {
        await Message.updateMany(
          { chatId, sender: { $ne: receiverUserId } },
          { $addToSet: { seenBy: receiverUserId }, $set: { status: "seen" } }
        );

        const messages = await Message.find({ chatId })
          .populate("sender")
          .populate("postId")
          .sort({ createdAt: 1 });

        io.to(receiverUserId).emit("messageSeen", { chatId, messages });
        io.to(senderUserId).emit("messageSeen", { chatId, messages });
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("notificationSeen", async (userId) => {
      try {
        if (!userId) return;

        await Notification.updateMany(
          { receiver: userId, isRead: false },
          { $set: { isRead: true } }
        );

        await Notification.updateMany(
          { type: "announcement", isRead: false },
          { $set: { isRead: true } }
        );

        const notifications = await Notification.find({
          $or: [{ receiver: userId }, { type: "announcement" }]
        })
          .populate("sender", "fullName profileImage")
          .populate("receiver", "fullName profileImage")
          .sort({ createdAt: -1 });

        io.to(userId).emit("notificationSeen", notifications);
      } catch (error) {
        console.error("notificationSeen error:", error);
      }
    });

    socket.on("businessVerify", (userId) => {
      if (!userId) return;
      io.to(userId).emit("businessVerify");
    });

    // ================= DISCONNECT =================
    socket.on("disconnect", async () => {
      const offlineUserId = Object.keys(onlineUsers).find((id) => {
        const sockets = onlineUsers[id];
        return sockets ? sockets.includes(socket.id) : false;
      });

      if (offlineUserId) {
        const sockets = onlineUsers[offlineUserId];
        if (sockets) {
          onlineUsers[offlineUserId] = sockets.filter((id) => id !== socket.id);
        }

        if (!onlineUsers[offlineUserId] || onlineUsers[offlineUserId].length === 0) {
          delete onlineUsers[offlineUserId];

          // ✅ CHECK USER FIRST
          let user = await User.findById(offlineUserId);

          if (user) {
            await User.findByIdAndUpdate(offlineUserId, {
              isOnline: false,
              lastSeen: new Date().toISOString(),
            });
          } else {
            // ✅ ELSE ADMIN
            const admin = await Admin.findById(offlineUserId);
            if (admin) {
              await Admin.findByIdAndUpdate(offlineUserId, {
                isOnline: false,
                lastSeen: new Date().toISOString(),
              });
            }
          }

          socket.broadcast.emit("userOffline", offlineUserId);
        }
      }
    });

  });

  return io;
};

export function getIO() {
  if (!io) throw new Error("socket not initialised.");
  return io;
}