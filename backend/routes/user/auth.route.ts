import express from "express";
import { registerUser, loginUser,cancelDeleteRequest,addPushNotifications, getSingleUserDetail,requestDeleteAccount,  updateUser, convertPremiumUser, refreshAccessToken, getAllUsers, getSingleUser, deleteUser } from "../../controllers/user/auth.controller.js";
import upload from "../../middlewares/upload.js";
import rateLimit from "express-rate-limit";  
import passport from 'passport';
import { AuthenticateOptionsGoogle } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import User from "../../models/user.model.js";
// const { OAuth2Client } = require('google-auth-library');
import {OAuth2Client} from "google-auth-library";
const  authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10, 
    message: "Too many authentication attempts from this IP, please try again after 15 minutes"
});
  
  
const router = express.Router();

router.post("/register", authRateLimit, registerUser);
router.post("/login", authRateLimit, loginUser);
router.post("/refresh", refreshAccessToken);
router.get("/get/:userId", getAllUsers);
router.get("/getbyid/:id", getSingleUser);
router.delete("/delete", deleteUser);
router.put("/update", upload.any(), updateUser);
router.put("/convert-premium", upload.fields([{ name: "paymentImage", maxCount: 1 }]), convertPremiumUser);
router.get("/get-by-id/:id", getSingleUserDetail);

router.delete("/delete/user/:userId", requestDeleteAccount);
router.patch("/recover/account/:userId", cancelDeleteRequest);
router.patch("/notification/pushToken", addPushNotifications);

router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'], 
    state: process.env.OAUTH_STATE_SECRET || "a_strong_fallback_random_string_here",
    
} as AuthenticateOptionsGoogle));

router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, async(err: any, user: any) => {
        if (err || !user) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/#/login?error=auth_failed`);
        }

        try {
        
            const accessToken = jwt.sign(
                { id: user._id }, 
                process.env.JWT_SECRET || "fallback_secret_key", 
                { expiresIn: '10m' }
            );

            const refreshToken = jwt.sign(
                { id: user._id }, 
                process.env.REFRESH_JWT_SECRET || "fallback_refresh_key", 
                { expiresIn: '7d' }
            );

       
          if (Array.isArray(user.refreshTokens)) {
  user.refreshTokens.push(refreshToken);
} else {
  // Fallback if it is not an array yet
  user.refreshTokens = [refreshToken];
}

            await user.save(); 

            // res.cookie('accessToken', accessToken, {
            //     httpOnly: false, secure: false, sameSite: 'lax', domain: 'localhost',
            //     maxAge: 10 * 60 * 1000
            // });
            // res.cookie("userData", JSON.stringify(user), {
            //     httpOnly: false, secure: false, sameSite: 'lax', domain: 'localhost',
            //     maxAge: 10 * 60 * 1000
            // });

          // Cookies ko poori tarah block karke data safely URL query parameters me pass kar rahe hain
const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

// Stringify aur URI safety ensure karne ke liye encodeURIComponent lagaya hai
const encodedUser = encodeURIComponent(JSON.stringify(user));

console.log("🍏 Google Auth Success! Redirecting via secure URL parameters.");

// 🚀 Fixed URL Redirection layout
return res.redirect(
  `${frontendBaseUrl}/#/auth-success?accessToken=${accessToken}&user=${encodedUser}`
);

        } catch (jwtError) {
            console.log("❌ JWT Generation Error:", jwtError);
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/#/login?error=token_failed`);
        }
    })(req, res, next);
});











// Maan lete hain aapke paas aapki Web Client ID environment variable me hai
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); 

router.post('/google-mobile', async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ success: false, message: "idToken is required" });
        }

        // 1. Google ke server se token ko verify karein
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID, // Aapki Web Client ID yahan aayegi
        });

        const payload = ticket.getPayload();
        if(!payload) return res.status(400).json({ success: false, message: "Invalid token payload" });
        const googleId = payload['sub']; // Unique Google ID
        const userEmail = payload['email'];
        const fullName = payload['name'];
        const isGoogleEmailVerified = payload['email_verified'] === true;

        if (!userEmail) {
            return res.status(400).json({ success: false, message: "No email associated with this Google profile" });
        }

        // 2. Database me User check karein (Bilkul aapke passport logic ki tarah)
        let user = await User.findOne({ 
            $or: [{ googleId: googleId }, { email: userEmail }] 
        });

        // Scenario A: Naya user register karna
        if (!user) {
            const generatedUserId = `USR-${googleId.substring(0, 8)}-${Math.floor(1000 + Math.random() * 9000)}`;
            user = await User.create({
                userId: generatedUserId,
                googleId: googleId,
                fullName: fullName,
                email: userEmail,
            });
        } 
        // Scenario B: Puraana user jo pehli baar Google se aa raha hai
        else if (!user.googleId) {
            if (isGoogleEmailVerified) {
                user.googleId = googleId;
                await user.save();
            } else {
                return res.status(401).json({ success: false, message: "This email is registered locally but unverified on Google." });
            }
        }

        // 3. Custom Access aur Refresh Tokens generate karein (Aapke callback route se copied)
        const accessToken = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET || "fallback_secret_key", 
            { expiresIn: '10m' }
        );

        const refreshToken = jwt.sign(
            { id: user._id }, 
            process.env.REFRESH_JWT_SECRET || "fallback_refresh_key", 
            { expiresIn: '7d' }
        );

        // Array safe check (Jo humne pehle discuss kiya tha)
        if (Array.isArray(user.refreshTokens)) {
            user.refreshTokens.push(refreshToken);
        } else {
            user.refreshTokens = [refreshToken];
        }
        await user.save();

        // 4. Response me data JSON format me bhejein (Cookies me nahi!)
        return res.status(200).json({
            status: 200,
            message: "Google login successful",
            accessToken: accessToken,
            refreshToken: refreshToken,
            data: user // Isme user ki poori object (`_id` wagera) jayegi
        });

    } catch (error) {
      console.error("❌ Mobile Google Auth Error");
    console.error(error);
    console.error(error.message);
    console.error(error.stack);

        return res.status(500).json({ success: false, message: "Internal Server Error during Google Auth" });
    }
});



export default router;

