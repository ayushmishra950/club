import express from "express";
import { addSuggestion, getAllSuggestions, getSuggestionById, deleteSuggestion } from "../../controllers/user/suggestion.controller.js";

const router = express.Router();

router.post("/add", addSuggestion);
router.get("/get/:id", getAllSuggestions);
router.get("/getbyid", getSuggestionById);
router.delete("/delete", deleteSuggestion);


export default router;