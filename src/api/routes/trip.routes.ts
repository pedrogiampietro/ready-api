import { Router } from "express";
import * as tripController from "../controllers/tripController";
import { upload } from "../../middlewares/multer";

const router = Router();

router.get("/", tripController.getAllTrip);
router.get("/trips-by-user/:userId", tripController.getAllTripsByUserId);
router.post("/save-with-ia", tripController.createTripByIA);
router.post(
  "/create",
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  tripController.createTrip
);
router.put(
  "/:id",
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  tripController.updateTrip
);

export default router;
