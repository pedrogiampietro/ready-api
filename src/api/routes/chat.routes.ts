import { Router } from "express";
import { chat, embellishTitleChat } from "../controllers/chatController";

const router = Router();

router.post("/", chat);
router.post("/embellish-title", embellishTitleChat);

export default router;
