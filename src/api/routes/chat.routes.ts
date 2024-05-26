import { Router } from "express";
import { chat } from "../controllers/chatController";

const router = Router();

router.post("/", chat);

export default router;
