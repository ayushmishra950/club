import { addReview, getAllReviews } from "../../controllers/user/review.controller.js";
import { Router } from "express";

const router = Router();

router.post("/add", addReview);
router.get("/get/:id", getAllReviews);


export default router;
