import express from "express";
import { addSuggestion, getAllSuggestions, updateSuggestionStatus, getSuggestionById, deleteSuggestion, replyToSuggestion } from "../../controllers/admin/suggestion.controller.js";

const router = express.Router();

router.post("/add", addSuggestion);
router.get("/get", getAllSuggestions);
router.get("/getbyid", getSuggestionById);
router.delete("/delete/:id", deleteSuggestion);
router.put("/update", updateSuggestionStatus);
router.post("/reply", replyToSuggestion);


export default router;