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
    const { fullName, fatherName, motherName, email, phone, dob, gender, maritalStatus, occupation, address, city, state, password, confirmPassword } = req.body;

    const io = getIO();

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

    if (existingUser) {
      return res.status(400).json({
        success: false, message: "User already exists with this email or phone"
      });
    }

    const userId = `USR-${nanoid(8)}`;

    const user = await User.create({
      fullName, fatherName, motherName, email, phone, dob, gender, maritalStatus, occupation, address, city, state, password, userId
    });

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

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

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

    res.status(200).json({ success: true, message: "Login successful", data: user, accessToken});



  } catch (error: any) {
    console.log(error?.message)
    res.status(500).json({ success: false, message: error.message});
  }

};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token not found"});
    }

    const decoded = jwt.verify( refreshToken, process.env.REFRESH_TOKEN_SECRET!) as { id: string };

    const newAccessToken = jwt.sign( { id: decoded.id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "15m" });

    res.status(200).json({ success: true, accessToken: newAccessToken});

  } catch (error: any) {

    res.status(403).json({ success: false, message: "Invalid refresh token", error: error.message});
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ isVerified: true , blocked: false }).select("-password");

    res.status(200).json({ success: true, count: users.length, data: users});

  } catch (error: any) {

    res.status(500).json({ success: false, message: "Server error", error: error.message});
  }
};

export const getSingleUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "userId not Found." });

    const user = await User.findById(id).select("-password").populate("donations");

    if (!user) { return res.status(404).json({   success: false,   message: "User not found" });
    }
    const friends = await FriendRequest.find({ from: id, status: "accepted" }).populate("to", "fullName profileImage occupation isOnline");

    res.status(200).json({ success: true, data: user, friends});

  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error", error: error.message});
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) { return res.status(404).json({   success: false,   message: "User not found" });}

    res.status(200).json({ success: true, message: "User deleted successfully"});

  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error", error: error.message});
  }
};



export const updateUser = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      fullName,
      fatherName,
      motherName,
      role,
      blocked,
      email,
      phone,
      dob,
      gender,
      maritalStatus,
      occupation,
      address,
      city,
      state,
      password,
      isVerified,
      donationsCount,
      skills,
      hobbies,
      accountType,
      businessName,
      businessCategory,
      businessDescription,
      website,
      businessPhone,
      businessAddress,
      workingHours,
      spouseName,
      spouseEmail,
    } = req.body;
    const io = getIO();

    if (!userId) {
      return res.status(400).json({ success: false, message: "UserId is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // ==================== Handle File Uploads ====================
    const files = (req as any).files;

    if (files?.profileImage?.[0]?.buffer) {
      const profileUrl = await uploadToCloudinary(files.profileImage[0].buffer, files.profileImage[0].mimetype, "profile");
      user.profileImage = profileUrl;
    }

    if (files?.coverImage?.[0]?.buffer) {
      const coverUrl = await uploadToCloudinary(files.coverImage[0].buffer, files.coverImage[0].mimetype, "cover");
      user.coverImage = coverUrl;
    }

    if (files?.businessCoverImage?.[0]?.buffer) {
      const coverUrl = await uploadToCloudinary(files.businessCoverImage[0].buffer, files.businessCoverImage[0].mimetype, "business-cover");
      user.businessCoverImage = coverUrl;
    }

    // ==================== Update Fields ====================
    if (fullName !== undefined) user.fullName = fullName;
    if (fatherName !== undefined) user.fatherName = fatherName;
    if (motherName !== undefined) user.motherName = motherName;
    if (role !== undefined) user.role = role;
    if (blocked !== undefined) user.blocked = blocked;

    if (email !== undefined) user.email = email.toLowerCase().trim();
    if (phone !== undefined) user.phone = phone;

    if (dob !== undefined) user.dob = new Date(dob);
    if (gender !== undefined) user.gender = gender;
    if (maritalStatus !== undefined) user.maritalStatus = maritalStatus;
    if (occupation !== undefined) user.occupation = occupation;

    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;

    if (isVerified !== undefined) user.isVerified = isVerified;
    if (donationsCount !== undefined) user.donationsCount = donationsCount;
    if (spouseName !== undefined) user.spouseName = spouseName;
    if (spouseEmail !== undefined) user.spouseEmail = spouseEmail;

    // Skills & Hobbies
    if (skills !== undefined) {
      user.skills = Array.isArray(skills) ? skills : skills.split(",").map((s: string) => s.trim());
    }
    if (hobbies !== undefined) {
      user.hobbies = Array.isArray(hobbies) ? hobbies : hobbies.split(",").map((s: string) => s.trim());
    }

    // Business Fields
    if (accountType !== undefined) user.accountType = accountType;
    if (businessName !== undefined) user.businessName = businessName;
    if (businessCategory !== undefined) user.businessCategory = businessCategory;
    if (businessDescription !== undefined) user.businessDescription = businessDescription;
    if (website !== undefined) user.website = website;
    if (businessPhone !== undefined) user.businessPhone = businessPhone;
    if (businessAddress !== undefined) user.businessAddress = businessAddress;
    if (workingHours !== undefined) user.workingHours = workingHours;

    // Password (will hash via schema pre-save)
    if (password !== undefined && password.trim() !== "") {
      user.password = password;
    }

    await user.save();

    const updatedUser = await User.findById(userId).select("-password");

    io.emit("updateProfileFromUser")

    return res.status(200).json({ success: true, message: "User profile updated successfully.", user: updatedUser});
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Failed to update user profile", error: error.message,});
  }
};



export const convertPremiumUser = async(req:Request, res:Response)=>{
  try{
       const {userId, transitionNumber} = req.body;
       const files = (req as any).files;
       const file = files?.paymentImage?.[0];
       const io = getIO();

       if(!userId || transitionNumber?.trim() === "" || !file || file.buffer.length === 0){
         return res.status(400).json({ success: false, message: "userId, transitionNumber, and paymentImage are required" });
       }

       const user = await User.findById(userId);
        if(!user){
          return res.status(404).json({ success: false, message: "User not found" });
        };

        let imageUrl =null;
        if(file.buffer){
          imageUrl = await uploadToCloudinary(file.buffer, file.mimetype, "payment");
        };
          if(imageUrl){
        user.paymentImage = imageUrl;
         user.transitionNumber = transitionNumber;
        await user.save();

        io.emit("premiumStatusUpdated", user);

        res.status(200).json({ success: true, message: "User converted to premium successfully", data:user });
          };
          

  }
  catch(err:any){
    res.status(500).json({ success: false, message: "Failed to convert user to premium", error: err.message,});
  }
}