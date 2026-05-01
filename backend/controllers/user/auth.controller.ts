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


export const registerUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, mobile, dob, gender, maritalStatus, occupation, address, city, state, password, confirmPassword } = req.body;

    const io = getIO();

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });

    if (existingUser) {
      return res.status(400).json({
        success: false, message: "User already exists with this email or mobile"
      });
    }

    const userId = `USR-${nanoid(8)}`;

    const user = await User.create({
      fullName, email, mobile, dob, gender, maritalStatus, occupation, address, city, state, password, userId
    });

    if (!user) { return res.status(500).json({ success: false, message: "Failed to create user" });}

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
    const { email, password } = req.body;


    let user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    console.log("isMatch", isMatch);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    console.log("isMatch", isMatch);

    if (user && user.role === "user") {
      await verifyUser(user?._id?.toString())
    }


    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

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

export const refreshAccessToken = async (req: Request, res: Response) => {

  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token not found" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as { id: string };

    const newAccessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "15m" });
    res.status(200).json({ success: true, accessToken: newAccessToken });
 
  } catch (error: any) {

    res.status(403).json({ success: false, message: "Invalid refresh token", error: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ isVerified: true, blocked: false }).select("-password");

    res.status(200).json({ success: true, count: users.length, data: users });

  } catch (error: any) {

    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getSingleUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "userId not Found." });

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const friends = await FriendRequest.find({ $or: [{ from: id }, { to: id }] })
      .populate("from", "fullName profileImage occupation isOnline friends")
      .populate("to", "fullName profileImage occupation isOnline friends")
      .lean();

    const friendList = friends.map(f => {
      const friend = f.from._id.toString() === id ? f.to : f.from;

      return {
        ...friend,
        status: f.status,
        requestId: f._id
      };
    });

    res.status(200).json({ success: true, data: user, friends: friendList });

  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
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

    console.log("Valid businesses count:", incomingBusinesses.length);

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
}