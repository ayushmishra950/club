import express from "express";
import { registerUser, loginUser, updateUser, convertPremiumUser, refreshAccessToken, getAllUsers, getSingleUser, deleteUser } from "../../controllers/user/auth.controller.js";
import upload from "../../middlewares/upload.js";
import rateLimit from "express-rate-limit";  

const  authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10, 
    message: "Too many authentication attempts from this IP, please try again after 15 minutes"
})
  
  
const router = express.Router();

router.post("/register", authRateLimit, registerUser);
router.post("/login", authRateLimit, loginUser);
router.post("/refresh", refreshAccessToken);
router.get("/get", getAllUsers);
router.get("/getbyid/:id", getSingleUser);
router.delete("/delete", deleteUser);
router.put("/update", upload.any(), updateUser);
router.put("/convert-premium", upload.fields([{ name: "paymentImage", maxCount: 1 }]), convertPremiumUser);

export default router;

