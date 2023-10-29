import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { blockUser, getUsers, login } from "../controllers/admin.js";

const router=Router()

router.post("/adminLogin",login)

router.get("/getUsers",authMiddleware,getUsers)

router.put("/blockUser/:userId",authMiddleware,blockUser)

export default router;