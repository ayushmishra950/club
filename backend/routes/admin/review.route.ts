import express from "express";
import {addReview,getReviews,getReviewById, updateReview, deleteReview} from "../../controllers/admin/review.controller.js";

const router = express.Router();

router.post("/add", addReview);
router.get("/get", getReviews);
router.get("/getbyid/:id", getReviewById);
router.put("/update", updateReview);
router.delete("/delete/:id", deleteReview);


export default router;