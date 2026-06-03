import mongoose, { Schema } from "mongoose";
const eventCategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        required: true
    }
}, {
    timestamps: true
});
const Category = mongoose.model("Category", eventCategorySchema);
export default Category;
//# sourceMappingURL=event.category.model.js.map