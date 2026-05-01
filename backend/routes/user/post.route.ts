import express from "express";
import {toggleLikePost,addPostNotes,deletePost, sharePost, addComment, likeUnlikeComment, replyToComment} from "../../controllers/user/post.controller.js";


const router = express.Router();

router.post("/like/toggle", toggleLikePost);
router.post("/notes/add", addPostNotes);
router.post("/comment/add", addComment);
router.post("/comment/like-toggle", likeUnlikeComment);
router.post("/comment/reply", replyToComment);
router.post("/share", sharePost);
router.put("/delete", deletePost);
export default router;