import mongoose, { Schema } from "mongoose";
const gallerySchemas = new Schema({
    event: {
        type: mongoose.Types.ObjectId,
        ref: "Event",
        required: true
    },
    image: [{
            type: String,
            required: true
        }],
    important: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        required: true,
        trim: true
    }
});
const gallery = mongoose.model("Gallery", gallerySchemas);
export default gallery;
