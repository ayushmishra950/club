import express from "express";
import {getMonthlyDonationSummary, dashboardSummary} from "../../controllers/admin/dashboard.controller.js";

const router = express.Router();

router.get("/summary", dashboardSummary);
router.get("/graph", getMonthlyDonationSummary);


export default router;