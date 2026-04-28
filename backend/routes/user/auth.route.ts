import express from "express";
import { registerUser, loginUser, updateUser, convertPremiumUser, refreshAccessToken, getAllUsers, getSingleUser, deleteUser } from "../../controllers/user/auth.controller.js";
import upload from "../../middlewares/upload.js";


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.get("/get", getAllUsers);
router.get("/getbyid/:id", getSingleUser);
router.delete("/delete", deleteUser);
router.put("/update", upload.any(), updateUser);
router.put("/convert-premium", upload.fields([{ name: "paymentImage", maxCount: 1 }]), convertPremiumUser);

export default router;

