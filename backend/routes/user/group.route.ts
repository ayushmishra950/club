import express from "express";
import { getAllGroups, toggleMember, removeMemberFromGroup } from "../../controllers/user/group.controller.js";

const router = express.Router();

router.get("/get", getAllGroups);
router.post("/toggle-member", toggleMember);
router.post("/remove-member", removeMemberFromGroup);
export default router;