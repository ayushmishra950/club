import express from "express";
import {createAdmin, adminLogin, getAdmins, getAdminById, updateAdmin, deleteAdmin} from "../../controllers/admin/auth.controller.js";
const router = express.Router();


router.post("/register", createAdmin);
router.post("/login", adminLogin);
router.post("/get", getAdmins);
router.post("/getbyid", getAdminById);
router.post("/update", updateAdmin);
router.post("/delete", deleteAdmin);

export default router;
