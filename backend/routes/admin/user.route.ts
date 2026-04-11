import express from "express";
import {getAllUsers,handleVerifyBusinessUser, handleVerifyUser, roleAssignUser, handleBlockAndUnBlockUser, deleteUser} from "../../controllers/admin/user.controller.js";


const router = express.Router();

router.get("/get", getAllUsers);
router.patch("/verify/:id", handleVerifyUser);
router.patch("/block/toggle/:id", handleBlockAndUnBlockUser);
router.delete("/delete/:id", deleteUser);
router.patch("/role/assign", roleAssignUser);
router.post("/business/verify", handleVerifyBusinessUser);

export default router;