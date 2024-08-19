import { Router } from "express";
import * as reviewController from "../controllers/reviewController";

const router = Router();

router.post("/", reviewController.createReview);
router.get("/:id", reviewController.getReview);

export default router;
