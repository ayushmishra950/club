import express from "express";
import { registerUser, loginUser,cancelDeleteRequest,addPushNotifications, getSingleUserDetail,requestDeleteAccount,  updateUser, convertPremiumUser, refreshAccessToken, getAllUsers, getSingleUser, deleteUser } from "../../controllers/user/auth.controller.js";
import upload from "../../middlewares/upload.js";
import rateLimit from "express-rate-limit";  
import passport from 'passport';
import { AuthenticateOptionsGoogle } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';

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
    passport.authenticate('google', { session: false }, async(err, user) => {
        if (err || !user) {
            return res.redirect('http://localhost:8080/#/login?error=auth_failed');
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

       
          if (Array.isArray(user.refreshToken)) {
  user.refreshToken.push(refreshToken);
} else {
  // Fallback if it is not an array yet
  user.refreshToken = [refreshToken];
}

            await user.save(); 

            res.cookie('accessToken', accessToken, {
                httpOnly: false, secure: false, sameSite: 'lax', domain: 'localhost',
                maxAge: 10 * 60 * 1000
            });
            res.cookie("userData", JSON.stringify(user), {
                httpOnly: false, secure: false, sameSite: 'lax', domain: 'localhost',
                maxAge: 10 * 60 * 1000
            });


            console.log("🍏 Google Auth Success! Cookie set safely.");
            
            return res.redirect(`http://localhost:8080/#/auth-success`);
        } catch (jwtError) {
            console.log("❌ JWT Generation Error:", jwtError);
            return res.redirect('http://localhost:8080/#/login?error=token_failed');
        }
    })(req, res, next);
});


export default router;

