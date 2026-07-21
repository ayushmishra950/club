import dotenv from 'dotenv';
dotenv.config();
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';



const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = process.env.GOOGLE_CALLBACK_URL;

if (!clientID || !clientSecret || !callbackURL) {
  throw new Error("Missing Google OAuth environment configurations in your .env file!");
}

passport.use(new GoogleStrategy({
    clientID,
    clientSecret,
    callbackURL
  },
  async (accessToken: string, refreshToken: string, profile: any, done: Function) => {
    try {
      const userEmail = profile.emails?.[0]?.value;
      if (!userEmail) {
        return done(new Error("No email associated with this Google profile"), undefined);
      }

      // Safe boolean mapping for verification status
      const isGoogleEmailVerified = profile._json.email_verified === true;
   
      let user = await User.findOne({ 
        $or: [
          { googleId: profile.id }, 
          { email: userEmail }
        ] 
      });

      // Scenario A: Completely new visitor registration
     // Scenario A: Completely new visitor registration
if (!user) {
    // Unique User ID
    const generatedUserId = `USR-${profile.id.substring(0, 8)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // First name extract
    const firstName =
        profile.displayName?.trim().split(" ")[0].toLowerCase() || "user";

    // Default password
    const defaultPassword = `${firstName}@123`;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    user = await User.create({
        userId: generatedUserId,
        googleId: profile.id,
        fullName: profile.displayName,
        email: userEmail,
        password: hashedPassword,
    });

    return done(null, user);
}

      // Scenario B: Existing Email user logging via Google for the first time
      if (!user.googleId) {
        if (isGoogleEmailVerified) {
          user.googleId = profile.id;
          await user.save();
        } else {
          return done(new Error("This email is registered locally but unverified on Google. Access denied for security."), undefined);
        }
      }

      // Scenario C: Returning Google User
      return done(null, user);

    } catch (error) {
      console.error("Passport Google Strategy Error:", error);
      return done(error, undefined);
    }
  }
));




export default passport;


