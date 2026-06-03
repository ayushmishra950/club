import mongoose from "mongoose";
import Announcement from "../../models/announcement.model.js";
import { getIO } from "../../utils/socketHelper.js";
import { createNotificationInternal } from "../user/notification.controller.js";
import { NotificationType } from "../../models/notification.model.js";
/**
 * ---------------- CREATE ANNOUNCEMENT ----------------
 */
export const createAnnouncement = async (req, res) => {
    try {
        const { title, description, priority, createdBy } = req.body;
        const io = getIO();
        if (!title || !createdBy) {
            return res.status(400).json({
                message: "Title and createdBy are required",
            });
        }
        if (!mongoose.Types.ObjectId.isValid(createdBy)) {
            return res.status(400).json({ message: "Invalid createdBy ID" });
        }
        const announcement = await Announcement.create({
            title,
            description,
            priority: priority || "medium",
            createdBy,
        });
        await createNotificationInternal(createdBy, createdBy, NotificationType.ANNOUNCEMENT, undefined, `Admin sent a New Announcement.`);
        io.emit("announcement", announcement);
        return res.status(201).json({
            message: "Announcement created successfully",
            announcement,
        });
    }
    catch (err) {
        return res.status(500).json({
            message: err.message || "Server Error",
        });
    }
};
/**
 * ---------------- GET ALL ANNOUNCEMENTS ----------------
 */
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
/**
 * ---------------- DELETE ANNOUNCEMENT ----------------
 */
export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }
        const deleted = await Announcement.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Announcement not found" });
        }
        return res.status(200).json({
            message: "Announcement deleted successfully",
        });
    }
    catch (err) {
        return res.status(500).json({
            message: err.message || "Server Error",
        });
    }
};
//# sourceMappingURL=announcement.controller.js.map