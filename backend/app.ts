import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDb from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initSocket } from "./utils/socketHelper.js";
import rateLimit from "express-rate-limit";
import http from "http";
import passport from "./utils/google.fb.login.js"
import session from 'express-session';
import helmet from "helmet";
import dns from "dns";
import path from "path"; // 1. path मॉड्यूल इंपोर्ट किया
import { fileURLToPath } from "url"; // ES Modules के लिए ज़रूरी

// ES Modules में __dirname सेट करने के लिए
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// admin routes 
import adminAuthRoutes from "./routes/admin/auth.route.js";
import adminUserRoutes from "./routes/admin/user.route.js";
import adminDonationRoutes from "./routes/admin/donation.route.js";
import adminEventRoutes from "./routes/admin/event.route.js";
import adminGalleryRoutes from "./routes/admin/gallery.route.js";
import adminDashboardRoutes from "./routes/admin/dashboard.route.js";
import adminCategoryRoutes from "./routes/admin/category.route.js";
import adminPostRoutes from "./routes/admin/post.route.js";
import adminGroupRoutes from "./routes/admin/group.route.js";
import adminBusinessGroupRoutes from "./routes/admin/business.group.route.js";
import adminAnnouncementRoutes from "./routes/admin/announcement.route.js";
import adminChatRoutes from "./routes/admin/chat.route.js";
import adminSuggestionRoutes from "./routes/admin/suggestion.route.js";
import adminNotificationRoutes from "./routes/admin/notification.route.js";
import adminNewsRoutes from "./routes/admin/news.route.js";
import adminReviewsRoutes from "./routes/admin/review.route.js"

// user routes
import userAuthRoutes from "./routes/user/auth.route.js";
import userPostRoutes from "./routes/user/post.route.js";
import userGroupRoutes from "./routes/user/group.route.js";
import userFrinendRoutes from "./routes/user/friendRequest.route.js";
import userChatRoutes from "./routes/user/chat.route.js";
import userNotificationRoutes from "./routes/user/notification.route.js";
import userAnnouncementRoutes from "./routes/user/announcement.route.js";
import userSuggestionRoutes from "./routes/user/suggestion.route.js";
import userReviewRoutes from "./routes/user/review.route.js";
import userBlockRoutes from "./routes/user/block.route.js";
import resetPasswordRoutes from "./routes/user/resetPassword.route.js";

const app = express();


connectDb();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: [process.env.FRONTEND_USER_LOCAL_URL, process.env.FRONTEND_ADMIN_LOCAL_URL, process.env.FRONTNED_ADMIN_PRODUCTION_URL, process.env.FRONTEND_USER_PRODUCTION_URL], credentials: true }))
app.use(session({
  secret: process.env.SESSION_SECRET || 'super_secure_random_key_string',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, 
    httpOnly: true,
    maxAge: 10 * 60 * 1000 
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());

// admin route
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/user", adminUserRoutes);
app.use("/api/admin/donation", adminDonationRoutes);
app.use("/api/admin/event", adminEventRoutes);
app.use("/api/admin/gallery", adminGalleryRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/category", adminCategoryRoutes);
app.use("/api/admin/post", adminPostRoutes);
app.use("/api/admin/group", adminGroupRoutes);
app.use("/api/admin/businessgroup", adminBusinessGroupRoutes);
app.use("/api/admin/announcement", adminAnnouncementRoutes);
app.use("/api/admin/chat", adminChatRoutes);
app.use("/api/admin/suggestion", adminSuggestionRoutes);
app.use("/api/admin/notification", adminNotificationRoutes);
app.use("/api/admin/news", adminNewsRoutes);
app.use("/api/admin/reviews", adminReviewsRoutes);

// user route
app.use("/api/user/auth", userAuthRoutes);
app.use("/api/user/post", userPostRoutes);
app.use("/api/user/group", userGroupRoutes);
app.use("/api/user/friend", userFrinendRoutes);
app.use("/api/user/chat", userChatRoutes);
app.use("/api/user/notification", userNotificationRoutes);
app.use("/api/user/announcement", userAnnouncementRoutes);
app.use("/api/user/suggestion", userSuggestionRoutes);
app.use("/api/user/review", userReviewRoutes);
app.use("/api/user/block", userBlockRoutes);
app.use("/api/user/password", resetPasswordRoutes);

// ==========================================
// FRONTEND & ADMIN BUILD ROUTING LOGIC (NO-STAR CATCH-ALL)
// ==========================================

// 1. दोनों बिल्ड्स के एसेट्स (CSS/JS) को सही से सर्व करने के लिए स्टैटिक फोल्डर डिक्लेअर करें
app.use("/admin", express.static(path.join(__dirname, "admin_build")));
app.use(express.static(path.join(__dirname, "user_build")));

// 2. यूनिवर्सल मिडलवेयर जो बचे हुए सभी राउट्स को पकड़ कर कंडीशनली फ़ाइल भेजेगा
app.use((req, res) => {
    // अगर यूज़र ने ब्राउज़र में /admin या /admin/login जैसी कोई रिक्वेस्ट की है
    if (req.path.startsWith("/admin")) {
        return res.sendFile(path.join(__dirname, "admin_build", "index.html"));
    }
    
    // बाकी सभी सामान्य रिक्वेस्ट्स (जैसे /login, /profile) के लिए
    return res.sendFile(path.join(__dirname, "user_build", "index.html"));
});

// ==========================================

const port = process.env.PORT || 5000;

const server = http.createServer(app);

initSocket(server);

server.listen(port, () => {
    console.log(`server is running on port ${port}`)
})
