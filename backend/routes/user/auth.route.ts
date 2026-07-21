import express from "express";
import { registerUser, loginUser,cancelDeleteRequest,addPushNotifications, getSingleUserDetail,requestDeleteAccount,  updateUser, convertPremiumUser, refreshAccessToken, getAllUsers, getSingleUser, deleteUser } from "../../controllers/user/auth.controller.js";
import upload from "../../middlewares/upload.js";
import rateLimit from "express-rate-limit";  
import passport from 'passport';
import { AuthenticateOptionsGoogle } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import User from "../../models/user.model.js";
import appleSigninAuth from 'apple-signin-auth';
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
  user.refreshTokens = [refreshToken];
}

            await user.save(); 



const frontendBaseUrl = process.env.FRONTEND_USER_PRODUCTION_URL || process.env.FRONTEND_USER_LOCAL_URL;
const encodedUser = encodeURIComponent(JSON.stringify(user));

console.log("🍏 Google Auth Success! Redirecting via secure URL parameters.");

return res.redirect(
  `${frontendBaseUrl}/#/auth-success?accessToken=${accessToken}&user=${encodedUser}`
);
        } catch (jwtError) {
            console.log("❌ JWT Generation Error:", jwtError);
            return res.redirect(`${process.env.FRONTEND_USER_PRODUCTION_URL || process.env.FRONTEND_USER_LOCAL_URL}/#/login?error=token_failed`);
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

        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if(!payload) return res.status(400).json({ success: false, message: "Invalid token payload" });
        const googleId = payload['sub']; 
        const userEmail = payload['email'];
        const fullName = payload['name'];
        const isGoogleEmailVerified = payload['email_verified'] === true;

        if (!userEmail) {
            return res.status(400).json({ success: false, message: "No email associated with this Google profile" });
        }

        let user = await User.findOne({ 
            $or: [{ googleId: googleId }, { email: userEmail }] 
        });

        if (!user) {
            const generatedUserId = `USR-${googleId.substring(0, 8)}-${Math.floor(1000 + Math.random() * 9000)}`;
            user = await User.create({
                userId: generatedUserId,
                googleId: googleId,
                fullName: fullName,
                email: userEmail,
            });
        } 
        else if (!user.googleId) {
            if (isGoogleEmailVerified) {
                user.googleId = googleId;
                await user.save();
            } else {
                return res.status(401).json({ success: false, message: "This email is registered locally but unverified on Google." });
            }
        }

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
            user.refreshTokens = [refreshToken];
        }
        await user.save();

        return res.status(200).json({
            status: 200,
            message: "Google login successful",
            accessToken: accessToken,
            refreshToken: refreshToken,
            data: user
        });

    } catch (error) {
      console.error("❌ Mobile Google Auth Error");
    console.error(error);
    console.error(error.message);
    console.error(error.stack);

        return res.status(500).json({ success: false, message: "Internal Server Error during Google Auth" });
    }
});








router.post('/apple-mobile', async (req, res) => {
    try {
        const { identityToken, firstName, lastName } = req.body;
        console.log("➡️ Payload Received:", req.body);

        if (!identityToken) {
            return res.status(400).json({ success: false, message: "identityToken is required" });
        }

        // 1. Apple Token Verify karein
        const applePayload = await appleSigninAuth.verifyIdToken(identityToken, {
            audience: process.env.APPLE_BUNDLE_ID, 
            ignoreExpiration: false, 
        });

        const appleId = applePayload.sub; 
        const userEmail = applePayload.email; 

        // 2. Database me User check karein
        let user = await User.findOne({ 
            $or: [{ appleId: appleId }, { email: userEmail }] 
        });

        // --- NAME LOGIC FIXED ---
        // Agar frontend se name aaya hai toh use karein, nahi toh email ka pehla part nikallein
        let fullName = 'Apple User';
        if (firstName) {
            fullName = `${firstName} ${lastName || ''}`.trim();
        } else if (userEmail) {
            fullName = userEmail.split('@')[0]; // e.g. priyank@infonic... se 'priyank' nikal lega
        }

        // Scenario A: Naya user register karna
        if (!user) {
            console.log("🆕 Creating New User in Database...");
            const generatedUserId = `USR-${appleId.substring(0, 8)}-${Math.floor(1000 + Math.random() * 9000)}`;
            
            // --- PASSWORD LOGIC FIXED ---
            // Aapke Google login logic jaisa, ek simple default ya random password generate karein
            const defaultPassword = `${fullName.toLowerCase().replace(/\s+/g, '')}@123`;

            user = await User.create({
                userId: generatedUserId,
                appleId: appleId,
                fullName: fullName, 
                email: userEmail || `${generatedUserId}@apple.com`, // Email na hone par fallback email
                password: defaultPassword, // 🌟 Yeh dene se 'password is required' wali error solve ho jayegi
            });
        } 
        // Scenario B: Puraana user jo pehli baar Apple se link ho raha hai
        else if (!user.appleId) {
            console.log("🔄 Linking Apple ID to Existing User...");
            user.appleId = appleId;
            if (!user.email && userEmail) {
                user.email = userEmail;
            }
            await user.save();
        }

        // 3. Custom Access aur Refresh Tokens generate karein
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
            user.refreshTokens = [refreshToken];
        }
        await user.save();

        console.log("✅ Apple Login Successful for User ID:", user._id);

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Apple login successful",
            accessToken: accessToken,
            refreshToken: refreshToken,
            data: user
        });

    } catch (error: any) {
        console.error("❌ Mobile Apple Auth Error");
        console.error(error.message);
        
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error during Apple Auth",
            error: error.message 
        });
    }
});



export default router;

