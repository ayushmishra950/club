import { Schema, model, Document, Types } from 'mongoose';

// 1. Interface define karein TypeScript type safety ke liye
export interface IPasswordReset extends Document {
    userId: Types.ObjectId;
    token: string;
    createdAt: Date;
}

// 2. Schema banayein
const passwordResetSchema = new Schema<IPasswordReset>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User', 
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        createdAt: { type: Date, default: Date.now, expires: 900,  },
    },
    { 
        timestamps: false, // Ismein updatedAt ki zaroorat nahi hai
        versionKey: false 
    }
);

// 3. Model export karein
export const PasswordReset = model<IPasswordReset>('PasswordReset', passwordResetSchema);
