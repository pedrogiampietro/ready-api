import { Router } from "express";
import * as reviewController from "../controllers/reviewController";
import { authenticateJWT } from "../../middlewares/jwt";

const router = Router();

router.post("/", authenticateJWT, reviewController.createReview);
router.get("/:id", authenticateJWT, reviewController.getReview);

export default router;
