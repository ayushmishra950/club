import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDb from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import {initSocket} from "./utils/socketHelper.js";
import http from "http";

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


// user routes
import userAuthRoutes from "./routes/user/auth.route.js";
import userPostRoutes from "./routes/user/post.route.js";
import userGroupRoutes from "./routes/user/group.route.js";
import userFrinendRoutes from "./routes/user/friendRequest.route.js";
import userChatRoutes from "./routes/user/chat.route.js";
import userNotificationRoutes from "./routes/user/notification.route.js";
import userAnnouncementRoutes from "./routes/user/announcement.route.js";
import userSuggestionRoutes from "./routes/user/suggestion.route.js";

const app = express();


connectDb();
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin:["http://localhost:8080", "http://localhost:8081"], credentials:true}))

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

// user route
app.use("/api/user/auth", userAuthRoutes);
app.use("/api/user/post", userPostRoutes);
app.use("/api/user/group", userGroupRoutes);
app.use("/api/user/friend", userFrinendRoutes);
app.use("/api/user/chat", userChatRoutes);
app.use("/api/user/notification", userNotificationRoutes);
app.use("/api/user/announcement", userAnnouncementRoutes);
app.use("/api/user/suggestion", userSuggestionRoutes);



app.get("/", (req, res) => {
    res.send("server is running.")
})

const port = process.env.PORT;


const server = http.createServer(app);
 
    initSocket(server);


server.listen(port, ()=>{
    console.log(`server is running on port ${port}`)
})

