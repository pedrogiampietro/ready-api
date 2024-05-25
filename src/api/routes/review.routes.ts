import { Router } from "express";
import * as reviewController from "../controllers/reviewController";

const router = Router();

router.post("/reviews", reviewController.createReview);
router.get("/reviews/:id", reviewController.getReview);

export default router;
