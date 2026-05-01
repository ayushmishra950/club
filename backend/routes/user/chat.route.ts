import express from "express";
import { getChatUsers, rejectGroupInvite, acceptGroupInvite, createOrGetChat, sendMessage, getMessages, getUserChats, markAsSeen } from "../../controllers/user/chat.controller.js"
import upload from "../../middlewares/upload.js";

const router = express.Router();

router.get("/users/:userId", getChatUsers);
router.post("/user/add", createOrGetChat);
router.post("/message/send", upload.fields([{ name: "image", maxCount: 1 }]), sendMessage);
router.get("/messages/:chatId", getMessages);
router.get("/users/:userId", getUserChats);
router.get("/users/:userId", markAsSeen);
router.post("/user/reject-group-invite", rejectGroupInvite);
router.post("/user/accept-group-invite", acceptGroupInvite);


export default router;
