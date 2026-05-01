import express from "express";
import { getAllUsers, acceptPaymentRequest, uploadExcel, activeAndInactiveUser, handleVerifyBusinessUser, handleVerifyUser, roleAssignUser, handleBlockAndUnBlockUser, deleteUser } from "../../controllers/admin/user.controller.js";
import upload from "../../middlewares/upload.js";


const router = express.Router();

router.get("/get", getAllUsers);
router.patch("/verify", handleVerifyUser);
router.patch("/block/toggle/:id", handleBlockAndUnBlockUser);
router.delete("/delete/:id", deleteUser);
router.patch("/role/assign", roleAssignUser);
router.post("/business/verify", handleVerifyBusinessUser);
router.patch("/active/inactive/:id", activeAndInactiveUser);
router.post("/upload-excel", upload.fields([{ name: "excelFile", maxCount: 1 }]), uploadExcel);
router.post("/accept-payment", acceptPaymentRequest);


export default router;