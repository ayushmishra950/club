import mongoose, { Schema } from "mongoose";
const DonationSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    category: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});
const Donation = mongoose.model("Donation", DonationSchema);
export default Donation;
