import { Router } from "express";
import { getBlockedUsers, unblockUser } from "../../controllers/user/block.controller.js";
const router = Router();
router.get("/get/:userId", getBlockedUsers);
router.patch("/unblocked", unblockUser);
export default router;
//# sourceMappingURL=block.route.js.map