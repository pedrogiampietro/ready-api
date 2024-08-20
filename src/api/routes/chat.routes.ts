import { Router } from "express";
import { chat, embellishTitleChat } from "../controllers/chatController";
import { authenticateJWT } from "../../middlewares/jwt";

const router = Router();

router.post("/", authenticateJWT, chat);
router.post("/embellish-title", authenticateJWT, embellishTitleChat);

export default router;
