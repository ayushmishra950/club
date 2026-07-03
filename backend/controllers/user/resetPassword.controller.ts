import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt'; // Password hash karne ke liye
import User from "../../models/user.model.js";
import { PasswordReset } from '../../models/resetPassword.model.js'; // Jo naya model banaya
import {sendPasswordResetSMS} from '../../utils/twilio.service.js';
import { sendPasswordResetEmail } from '../../utils/nodeMailer.js';
/**
 * 1. FORGOT PASSWORD - Link Generate Karne Ke Liye
 */ 
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.body;
    console.log("Received identifier:", identifier);

    if (!identifier) {
      res.status(400).json({ success: false, message: "Identifier is required" });
      return;
    }

    const user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    await PasswordReset.deleteMany({ userId: user._id });

    const resetToken = crypto.randomBytes(32).toString('hex');

    await PasswordReset.create({
      userId: user._id,
      token: resetToken,
    });

    const baseUrl =  'http://localhost:8080/#';
    const resetLink = `${baseUrl}/new-password?token=${resetToken}`;

    if (user.mobile === identifier) {
        if(!user.mobile) {
            res.status(400).json({ success: false, message: "User does not have a registered mobile number for SMS delivery." });
            return;
        }
      // Call Twilio helper service with the 2 required variables
      await sendPasswordResetSMS(user.mobile, resetLink);
      console.log(`SMS reset link triggered safely to: ${user.mobile}`);
    } else {
        if(!user.email) {
            res.status(400).json({ success: false, message: "User does not have a registered email for email delivery." });
            return;
        }
      await sendPasswordResetEmail(user.email, resetLink);
      console.log(`Email reset link generated for: ${user.email}`);
    }

    console.log("Reset Link generated:", resetLink);
    
    res.status(200).json({ 
      success: true, 
      message: "Password reset link generated/sent successfully", 
      link: resetLink // Keep for local development/testing sandbox
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


/**
 * 2. RESET PASSWORD - Naya Password Save Karne Ke Liye
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            res.status(400).json({ success: false, message: "Token and new password are required" });
            return;
        }

        // Database mein token dhoondein
        const resetEntry = await PasswordReset.findOne({ token });
        if (!resetEntry) {
            res.status(400).json({ success: false, message: "Invalid or expired token" });
            return;
        }

        // Naye password ko hash karein
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Existing User model mein password update karein
        await User.findByIdAndUpdate(resetEntry.userId, {
            password: hashedPassword,
        });

        // Use hone ke baad token ko turant delete karein
        await PasswordReset.deleteOne({ _id: resetEntry._id });

        res.status(200).json({
            success: true,
            message: "Password has been reset successfully. You can now login.",
        });

    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
