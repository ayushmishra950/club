import express from "express";
import {registerUser,  loginUser,updateUser,refreshAccessToken, getAllUsers, getSingleUser, deleteUser} from "../../controllers/user/auth.controller.js";
import upload from "../../middlewares/upload.js";


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.get("/get", getAllUsers);
router.get("/getbyid/:id", getSingleUser);
router.delete("/delete", deleteUser);
router.put("/update",upload.fields([{name:"profileImage", maxCount:1}, {name:"coverImage", maxCount:1}, {name:"businessCoverImage", maxCount:1}]), updateUser);


export default router;

