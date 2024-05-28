import { Router } from "express";
import * as tripController from "../controllers/tripController";

const router = Router();

router.get("/", tripController.getAllTrip);
router.post("/create", tripController.createTrip);
router.get("/:id", tripController.getTrip);

export default router;
