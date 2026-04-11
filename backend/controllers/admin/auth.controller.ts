import type  { Request, Response } from "express";
import Admin from "../../models/admin.model.js";
import User from "../../models/user.model.js";
import {generateAccessToken, generateRefreshToken} from "../../utils/generateToken.js";
import jwt from "jsonwebtoken";

// CREATE ADMIN
export const createAdmin = async (req: Request, res: Response) => {
  try {

    const { name, email, password, role } = req.body;

    let existingAdmin = await Admin.findOne({ email });

    if(!existingAdmin) {
        existingAdmin = await User.findOne({email});
    }

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists"
      });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: admin
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error
    });
  }
};


// ADMIN LOGIN
export const adminLogin = async (req: Request, res: Response) => {
  try {

    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

     const accessToken = generateAccessToken(admin._id.toString());
      const refreshToken = generateRefreshToken(admin._id.toString());
    
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
    res.status(200).json({
      success: true,
      message: "Login successful",
       admin,
      accessToken
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error
    });
  }
};


// GET ALL ADMINS
export const getAdmins = async (req: Request, res: Response) => {
  try {

    const admins = await Admin.find().select("-password");

    res.status(200).json({
      success: true,
      data: admins
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error
    });
  }
};


// GET SINGLE ADMIN
export const getAdminById = async (req: Request, res: Response) => {
  try {

    const admin = await Admin.findById(req.params.id).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error
    });
  }
};


// UPDATE ADMIN
export const updateAdmin = async (req: Request, res: Response) => {
  try {

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin updated",
      data: admin
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error
    });
  }
};


// DELETE ADMIN
export const deleteAdmin = async (req: Request, res: Response) => {
  try {

    const admin = await Admin.findByIdAndDelete(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin deleted"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error
    });
  }
};