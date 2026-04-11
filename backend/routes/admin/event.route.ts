import express from "express";
import {addEvent, getAllEvent, getSingleEvent, updateEvent, deleteEvent, addAndRemoveCandidateFromEvent} from "../../controllers/admin/event.controller.js";
import upload from "../../middlewares/upload.js";

const router = express.Router();

router.post("/add",upload.fields([{name:"coverImage", maxCount:1}]),addEvent);
router.get("/get",getAllEvent);
router.get("/getbyid/:id",getSingleEvent);
router.put("/update",upload.fields([{name:"coverImage", maxCount:1}]),updateEvent);
router.delete("/delete/:id",deleteEvent);
router.post("/candidate/interested",addAndRemoveCandidateFromEvent);


export default router;