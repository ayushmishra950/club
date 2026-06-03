import ReviewModel from "../../models/review.model.js";
import { getIO } from "../../utils/socketHelper.js";
// ✅ GET ALL REVIEWS
export const getReviews = async (_req, res) => {
    try {
        const reviews = await ReviewModel.find().sort({ createdAt: -1 }).populate("userId", "fullName profileImage");
        return res.status(200).json({
            success: true,
            data: reviews,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const getGlobalReviews = async (req, res) => {
    try {
        const reviews = await ReviewModel.find({ status: "approved" }).populate("userId", "fullName profileImage");
        return res.status(200).json({ reviews });
    }
    catch (err) {
        return res.status(500).json({
            message: err?.message || "Internal server error",
        });
    }
};
// ✅ GET SINGLE REVIEW
export const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await ReviewModel.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: review,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// ✅ UPDATE REVIEW
export const updateReview = async (req, res) => {
    try {
        const { id, ...obj } = req.body;
        const io = getIO();
        const updatedReview = await ReviewModel.findByIdAndUpdate(id, obj, { new: true });
        if (!updatedReview) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }
        ;
        io.emit("addReview", updatedReview);
        return res.status(200).json({
            success: true,
            message: "Review updated successfully",
            data: updatedReview,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// ✅ DELETE REVIEW
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const io = getIO();
        const deletedReview = await ReviewModel.findByIdAndDelete(id);
        if (!deletedReview) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }
        ;
        io.emit("deleteReview", id);
        return res.status(200).json({
            success: true,
            message: "Review deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const reviewStatusUpdate = async (req, res) => {
    try {
        const io = getIO();
        const { reviewId, status, adminReply } = req.body;
        if (!reviewId || !status || !adminReply) {
            return res.status(400).json({ message: "reviewId, status, message are required." });
        }
        const updateReview = await ReviewModel.findByIdAndUpdate(reviewId, { status, adminReply }, { new: true });
        if (!updateReview) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }
        io.emit("updateReview", updateReview);
        return res.status(200).json({ success: true, message: "Review status updated successfully", data: updateReview });
    }
    catch (err) {
        res.status(500).json({ message: err.message || "Something went wrong" });
    }
};
//# sourceMappingURL=review.controller.js.map