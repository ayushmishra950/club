import dotenv from 'dotenv';
dotenv.config();
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from "../models/user.model.js";



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
      if (!user) {
        // ⚡ FIXED: unique userId generate karna padega kyuki schema mein REQUIRED hai
        const generatedUserId = `USR-${profile.id.substring(0, 8)}-${Math.floor(1000 + Math.random() * 9000)}`;

        user = await User.create({
          userId: generatedUserId, // ✅ Added to pass validation
          googleId: profile.id,
          fullName: profile.displayName, // ✅ Valid with your schema
          email: userEmail,
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






















// Initialize Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID!,
    clientSecret: process.env.FACEBOOK_APP_SECRET!,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
    profileFields: ['id', 'displayName', 'emails'] // Request email permission explicitly
  },
  async (accessToken: string, refreshToken: string, profile: any, done: Function) => {
    try {
      let user = await User.findOne({ 
        $or: [{ facebookId: profile.id }, { email: profile.emails?.[0].value }] 
      });

      if (!user) {
        user = await User.create({
          facebookId: profile.id,
          fullName: profile.displayName,
          email: profile.emails?.[0].value,
          isVerified: true
        });
      } else if (!user.facebookId) {
        user.facebookId = profile.id;
        await user.save();
      }

      return done(null, user);
    } catch (error) {
      return done(error, undefined);
    }
  }
));


export default passport;



















// Senerio App k liye ye hai

