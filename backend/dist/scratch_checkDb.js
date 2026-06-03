import mongoose from "mongoose";
import dotenv from "dotenv";
import { Suggestion } from "./models/suggestion.model.js";
dotenv.config();
const mongoUrl = process.env.MONGO_URI;
if (!mongoUrl) {
    console.log("No Mongo URI found");
    process.exit(1);
}
async function run() {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB");
    const latestSuggestions = await Suggestion.find()
        .sort({ createdAt: -1 })
        .limit(5);
    console.log("LATEST SUGGESTIONS:", JSON.stringify(latestSuggestions, null, 2));
    await mongoose.disconnect();
    process.exit(0);
}
run().catch(console.error);
//# sourceMappingURL=scratch_checkDb.js.map