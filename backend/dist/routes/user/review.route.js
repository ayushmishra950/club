import { addReview, getAllReviews, getGlobalReviews } from "../../controllers/user/review.controller.js";
import { Router } from "express";
const router = Router();
router.post("/add", addReview);
router.get("/get/:id", getAllReviews);
router.get("/get/global", getGlobalReviews);
export default router;
