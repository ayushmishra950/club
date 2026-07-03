import type { Request, Response } from "express";
import User from "../../models/user.model.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/generateToken.js";
import jwt from "jsonwebtoken";
import { verifyUser } from "../../middlewares/user.js";
import uploadToCloudinary from "../../cloudinary/uploadToCloudinary.js";
import FriendRequest from "../../models/friendRequest.model.js";
import { getIO } from "../../utils/socketHelper.js";
import { createNotificationInternal } from "./notification.controller.js";
import { NotificationType } from "../../models/notification.model.js";
import { nanoid } from "nanoid";
import Post from "../../models/post.model.js";
import Admin from "../../models/admin.model.js";
import Block from "../../models/block.model.js";


export const registerUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, mobile, dob, gender, maritalStatus, occupation, address, city, state, password, confirmPassword } = req.body;

    const io = getIO();

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });

    if (existingUser) return res.status(400).json({ success: false, message: "User already exists with this email or mobile"});

    const userId = `USR-${nanoid(8)}`;

    const user = await User.create({
      fullName, email, mobile, dob, gender, maritalStatus, occupation, address, city, state, password, userId
    });

    if (!user) { return res.status(500).json({ success: false, message: "Failed to create user" }); }

    const safeUser = await User.findById(user._id).select("-password");

    io.emit("newUser", safeUser);

    await createNotificationInternal(
      user._id,
      user._id,
      NotificationType.NEW_USER,
      undefined,
      "New member registered. Please check member list."
    );

    return res.status(201).json({ success: true, message: "User registered successfully", data: safeUser });

  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



export const loginUser = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;


    let user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] }).select("+password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

const blockedDeleteStatuses = ["pending", "approved", "rejected"];

if ( user?.isDeleted || blockedDeleteStatuses.includes(user.deleteStatus)) {
  return res.status(403).json({ success: false, message:"Your account has been deleted. To recover your account, please contact the administrator at support@example.com or +91XXXXXXXXXX."});
}     
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user && user.role === "user") {
      await verifyUser(user?._id?.toString())
    }
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    if (user && user.refreshTokens) {
      user.refreshTokens.push(refreshToken);
    }
    await user.save();

    const platform = req?.body?.platform;

    if (platform === "mobile") {
      return res.status(200).json({ success: true, message: "Login successful", data: user, accessToken, refreshToken });
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ success: true, message: "Login successful", data: user, accessToken });

  } catch (error: any) {
    console.log(error?.message)
    res.status(500).json({ success: false, message: error.message });
  }

};
export const addPushNotifications = async ( req: Request, res: Response) => {
  try {
    const { userId, pushToken } = req.body;

    if (!userId || !pushToken)  return res.status(400).json({ message: "userId or pushToken is required.",  });
  
    const user = await User.findByIdAndUpdate( userId, { pushToken }, { new: true });

    if (!user) return res.status(404).json({ message: "user not found.", });

    return res.status(200).json({ success: true, message: "pushToken saved.", user });

  } catch (error: any) {
    console.log(error?.message);
    return res.status(500).json({ success: false, message: error?.message || "server error", });
  }
};


export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token not found" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as { id: string };

    // First check User
    let account = await User.findOne({ _id: decoded.id, refreshTokens: refreshToken });
    if (account?.isDeleted) return res.status(403).json({ message: "Account is scheduled for deletion." })

    // If not found then check Admin
    if (!account) {
      account = await Admin.findOne({ _id: decoded.id, refreshToken: refreshToken });
    }

    if (!account) {
      return res.status(403).json({ success: false, message: "Invalid refresh token" });
    }
    const newAccessToken = generateAccessToken(account._id.toString());

    return res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error: any) {
    console.error("Refresh Token Error:", error?.message);
    return res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  const userId = req.params.userId; 
  if(!userId) return res.status(400).json({success:false, message:"userId is required"});
     
  try {
    const blockRecords = await Block.find({
      $or: [
        { blockerId: userId },
        { blockedId: userId }
      ]
    });

    const restrictedUserIds: string[] = blockRecords.map(record => 
      record.blockerId.toString() === userId.toString() 
        ? record.blockedId.toString() 
        : record.blockerId.toString()
    );

    restrictedUserIds.push(userId as string);

    const users = await User.find({ 
      _id: { $nin: restrictedUserIds },
      isVerified: true, 
      blocked: false, 
      isDeleted: false 
    }).select("-password");

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
export const getSingleUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "User ID not found" })

    const user = await User.findById(id).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.isDeleted) return res.status(403).json({ success: false, message: "Account is deactivated" });

    const friends = await FriendRequest.find({ $or: [{ from: id }, { to: id }]})
      .populate({ path: "from", match: { isDeleted: false }, select: "fullName profileImage occupation isOnline friends"})
      .populate({ path: "to", match: { isDeleted: false }, select: "fullName profileImage occupation isOnline friends"})
      .lean();

    const friendList = friends.map((f) => {
        if (!f.from || !f.to) return null; 

        const friend = f.from._id.toString() === id ? f.to : f.from;

        if (!friend) return null;

        return { ...friend, status: f.status, requestId: f._id };
      })
      .filter(Boolean); // ✅ remove nulls
    return res.status(200).json({ success: true, data: user, friends: friendList});
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message});
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) { return res.status(404).json({ success: false, message: "User not found" }); }
    res.status(200).json({ success: true, message: "User deleted successfully" });

  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};




export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || req.body._id;
    const io = getIO();

    if (!userId) {
      return res.status(400).json({ success: false, message: "UserId required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user?.isDeleted) return res.status(403).json({ message: "Account is scheduled for deletion." });

    const files = (req as any).files as any[];

    const getFile = (fieldname: string) =>
      files?.find((f) => f.fieldname === fieldname);

    // ================= SAFE JSON PARSE =================
    const safeParseJSON = (data: any, fallback: any = []) => {
      if (!data) return fallback;
      if (typeof data === "string") {
        try {
          return JSON.parse(data);
        } catch {
          return fallback;
        }
      }
      return data;
    };

    // ================= FILE UPLOAD =================
    const profileImageFile = getFile("profileImage");
    if (profileImageFile) {
      const url = await uploadToCloudinary(
        profileImageFile.buffer,
        profileImageFile.mimetype,
        "profile"
      );
      user.profileImage = url;
    }

    const coverImageFile = getFile("coverImage");
    if (coverImageFile) {
      const url = await uploadToCloudinary(
        coverImageFile.buffer,
        coverImageFile.mimetype,
        "cover"
      );
      user.coverImage = url;
    }

    // ================= EXTRACT BODY =================
    const { businesses, children, ...rest } = req.body;

    const excludedFields = [
      "password",
      "friends",
      "businesses",
      "children",
      "userId",
      "_id",
      "createdAt",
      "updatedAt",
      "__v",
    ];

    // ================= NORMAL FIELDS =================
    Object.keys(rest).forEach((key) => {
      if (!excludedFields.includes(key) && rest[key] !== undefined) {
        let value = rest[key];

        if (
          (key === "skills" || key === "hobbies") &&
          typeof value === "string"
        ) {
          value = value
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);
        }

        (user as any)[key] = value;
      }
    });

    if (rest.password && rest.password.trim() !== "") {
      user.password = rest.password;
    }

    // ================= CHILDREN =================
    const parsedChildren = safeParseJSON(children, []);
    user.children = Array.isArray(parsedChildren) ? parsedChildren : [];

    // ================= BUSINESS CLEANING =================
    const incomingBusinessesRaw = safeParseJSON(businesses, []);

    // 🔥 REMOVE EMPTY BUSINESSES
    const incomingBusinesses = incomingBusinessesRaw.filter((biz: any) => {
      return (
        biz &&
        (
          biz.businessName?.trim() ||
          biz.businessCategory?.trim() ||
          biz.businessPhone?.trim() ||
          biz.businessDescription?.trim() ||
          biz.businessAddress?.trim()
        )
      );
    });

    const { nanoid } = await import("nanoid");


    // ================= MAP BUSINESSES =================
    const parsedBusinesses = incomingBusinesses.map((biz: any) => {
      const existingBiz = user.businesses.find(
        (b) => b.businessId === biz.businessId
      );

      return {
        ...biz,
        businessId: biz.businessId || `BIZ-${nanoid(8)}`,
        isVerified: existingBiz ? existingBiz.isVerified : "pending",
        businessCoverImage:
          typeof biz.businessCoverImage === "string"
            ? biz.businessCoverImage
            : existingBiz?.businessCoverImage || "",
      };
    });

    // ================= IMAGE UPLOAD =================
    const updatedBusinesses = [...parsedBusinesses];

    for (let i = 0; i < updatedBusinesses.length; i++) {
      const fieldName = `businessCoverImage_${i}`;
      const bizFile = getFile(fieldName);

      if (bizFile) {
        const url = await uploadToCloudinary(
          bizFile.buffer,
          bizFile.mimetype,
          "business-cover"
        );

        updatedBusinesses[i].businessCoverImage = url;
      }
    }

    // ================= SAVE ONLY IF REAL DATA =================
    user.businesses =
      incomingBusinesses.length > 0 ? updatedBusinesses : [];

    await user.save();

    const updatedUser = await User.findById(userId).select("-password");

    io.emit("updateProfileFromUser");

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: updatedUser,
    });

  } catch (error: any) {
    console.error("Update User Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update user profile",
    });
  }
};

export const convertPremiumUser = async (req: Request, res: Response) => {
  try {
    const { userId, amount, transitionNumber } = req.body;
    const files = (req as any).files;
    const file = files?.paymentImage?.[0];
    const io = getIO();

    if (!userId || !amount || transitionNumber?.trim() === "" || !file || file.buffer.length === 0) {
      return res.status(400).json({ success: false, message: "userId, amount, transitionNumber, and paymentImage are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    };
    if (user?.isDeleted) return res.status(403).json({ message: "Account is scheduled for deletion." })

    let imageUrl = null;
    if (file.buffer) {
      imageUrl = await uploadToCloudinary(file.buffer, file.mimetype, "payment");
    };
    if (imageUrl) {
      user.paymentImage = imageUrl;
      user.transitionNumber = transitionNumber;
      user.amount = amount;
      await user.save();

      io.emit("premiumStatusUpdated", user);

      res.status(200).json({ success: true, message: "User converted to premium successfully", data: user });
    };


  }
  catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to convert user to premium", error: err.message, });
  }
};















export const getSingleUserDetail = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    if (!userId)
      return res.status(400).json({ message: "userId not found." });

    // 1. USER
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "user not found." });
    if (user?.isDeleted) return res.status(403).json({ message: "Account is scheduled for deletion." })

    // 2. POSTS
    const posts = await Post.find({ createdBy: userId })
      .populate("createdBy", "fullName profileImage email isOnline isVerified");

    // 3. FOLLOWERS
    const followers = await FriendRequest.find({
      to: userId,
      status: "accepted",
    }).populate("from", "fullName profileImage");

    // 4. FOLLOWING
    const following = await FriendRequest.find({
      from: userId,
      status: "accepted",
    }).populate("to", "fullName profileImage");

    // 5. FRIENDS (mutual accepted)
    const sentRequests = await FriendRequest.find({
      from: userId,
      status: "accepted",
    });

    const receivedRequests = await FriendRequest.find({
      to: userId,
      status: "accepted",
    });

    const friendSet = new Set<string>();

    sentRequests.forEach((req) => {
      friendSet.add(req.to.toString());
    });

    receivedRequests.forEach((req) => {
      friendSet.add(req.from.toString());
    });

    const friendCount = friendSet.size;

    // OPTIONAL: agar friend list chahiye
    const friends = await User.find({
      _id: { $in: Array.from(friendSet) },
    }).select("fullName profileImage, email mobile");

    // 6. RESPONSE
    return res.status(200).json({
      user,
      posts,
      followers: followers.map((f) => f.from),
      following: following.map((f) => f.to),
      friends, friendCount,
    });

  } catch (err: any) {
    return res.status(500).json({
      message: err?.message || "Server Error.",
    });
  }
};








export const requestDeleteAccount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const io = getIO();
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.deleteStatus === "pending") {
      return res.status(400).json({ message: "Delete request already pending" });
    }

    if (user.isDeleted) {
      return res.status(400).json({ message: "Account already scheduled for deletion" });
    }

    user.deleteStatus = "pending";
    user.deleteDate = new Date();
    user.deleteReason = "user personal reason for account deleted.";
    user.isOnline = false;
    await user.save();
    io.emit("deleteRequest", user);

    return res.status(200).json({ message: "User Account Delete Successfully.",user, deleteStatus: user.deleteStatus });

  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message || "Server Error" });
  }
};

export const cancelDeleteRequest = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const io = getIO();
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.deleteStatus !== "pending") {
      return res.status(400).json({ message: "No pending delete request found" });
    }
    user.deleteStatus = "active";
    await user.save();
    io.emit("cancelDeleteRequest", user);
    return res.status(200).json({ message: "Delete request cancelled successfully", user });

  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};    