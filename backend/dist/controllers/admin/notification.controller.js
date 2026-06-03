import Notification from "../../models/notification.model.js";
export const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .populate("sender", "fullName profileImage")
            .populate("receiver", "fullName profileImage");
        res.status(200).json({ data: notifications });
    }
    catch (err) {
        res.status(500).json({ message: err?.mesage });
    }
};
//# sourceMappingURL=notification.controller.js.map