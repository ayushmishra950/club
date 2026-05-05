import { Request, Response } from "express";
import ReviewModel from "../../models/review.model.js";
import { getIO } from "../../utils/socketHelper.js";

// ✅ CREATE REVIEW
export const addReview = async (req: Request, res: Response) => {
  try {
    const { fullName, description } = req.body;
    const io = getIO();

    if (!fullName || !description) {
      return res.status(400).json({
        success: false,
        message: "Full name and description are required",
      });
    }

    const review = await ReviewModel.create({
      fullName,
      description,
    });

    io.emit("addReview", review);
    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET ALL REVIEWS
export const getReviews = async (_req: Request, res: Response) => {
  try {
    const reviews = await ReviewModel.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET SINGLE REVIEW
export const getReviewById = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ UPDATE REVIEW
export const updateReview = async (req: Request, res: Response) => {
  try {
    const {id, ...obj} = req.body;
    const io = getIO();

    const updatedReview = await ReviewModel.findByIdAndUpdate(
      id,
      obj,
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    };

      io.emit("addReview", updatedReview);

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ DELETE REVIEW
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const io = getIO();

    const deletedReview = await ReviewModel.findByIdAndDelete(id);

    if (!deletedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    };

    io.emit("deleteReview", id);
    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};