import mongoose, { Schema } from "mongoose";
export var NotificationType;
(function (NotificationType) {
    NotificationType["LIKE"] = "like";
    NotificationType["COMMENT"] = "comment";
    NotificationType["FRIEND_REQUEST"] = "friend_request";
    NotificationType["FRIEND_ACCEPT"] = "friend_accept";
    NotificationType["FRIEND_CANCEL"] = "friend_cancel";
    NotificationType["ANNOUNCEMENT"] = "announcement";
    NotificationType["FOLLOW"] = "follow";
    NotificationType["MESSAGE"] = "message";
    NotificationType["POST"] = "post";
    NotificationType["EVENT"] = "event";
    NotificationType["SUGGESTION"] = "suggestion";
    NotificationType["NEW_USER"] = "new_user";
})(NotificationType || (NotificationType = {}));
const notificationSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: Object.values(NotificationType),
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    message: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    date: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "pending"
    }
}, {
    timestamps: true
});
export default mongoose.model("Notification", notificationSchema);
//# sourceMappingURL=notification.model.js.map