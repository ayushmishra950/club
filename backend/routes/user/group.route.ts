import express from "express";
import { getAllGroups, toggleMember } from "../../controllers/user/group.controller.js";

const router = express.Router();

router.get("/get", getAllGroups);
router.post("/toggle-member", toggleMember);

export default router;