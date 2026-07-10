import mongoose from "mongoose";
import Announcement from "../../models/announcement.model.js";
export const getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .populate("createdBy", "fullName email profileImage")
            .sort({ createdAt: -1 });
        return res.status(200).json({
            announcements,
        });
    }
    catch (err) {
        return res.status(500).json({
            message: err.message || "Server Error",
        });
    }
};
/**
 * ---------------- GET ANNOUNCEMENT BY ID ----------------
 */
export const getAnnouncementById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }
        const announcement = await Announcement.findById(id).populate("createdBy", "fullName email profileImage");
        if (!announcement) {
            return res.status(404).json({ message: "Announcement not found" });
        }
        return res.status(200).json({
            announcement,
        });
    }
    catch (err) {
        return res.status(500).json({
            message: err.message || "Server Error",
        });
    }
};
