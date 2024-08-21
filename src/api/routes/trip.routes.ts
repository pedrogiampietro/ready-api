import { Router } from "express";
import * as tripController from "../controllers/tripController";
import { upload } from "../../middlewares/multer";
import { authenticateJWT } from "../../middlewares/jwt";

const router = Router();

router.get("/", authenticateJWT, tripController.getAllTrip);
router.get(
  "/trips-by-user/:userId",
  authenticateJWT,
  tripController.getAllTripsByUserId
);
router.post("/save-with-ia", authenticateJWT, tripController.createTripByIA);
router.post(
  "/create",
  authenticateJWT,
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  tripController.createTrip
);
router.put(
  "/:id",
  authenticateJWT,
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  tripController.updateTrip
);
router.delete("/:id", authenticateJWT, tripController.deleteTrip);
router.post(
  "/:tripId/restaurants",
  authenticateJWT,
  tripController.addRestaurant
);
router.post(
  "/:tripId/itineraries",
  authenticateJWT,
  tripController.addItinerary
);
router.get("/:tripId", authenticateJWT, tripController.getTripDetails);

export default router;
