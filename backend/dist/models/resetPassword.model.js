import { Schema, model } from 'mongoose';
// 2. Schema banayein
const passwordResetSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: { type: Date, default: Date.now, expires: 900, },
}, {
    timestamps: false, // Ismein updatedAt ki zaroorat nahi hai
    versionKey: false
});
// 3. Model export karein
export const PasswordReset = model('PasswordReset', passwordResetSchema);
