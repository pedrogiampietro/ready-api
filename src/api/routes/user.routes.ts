import { Router } from "express";
import * as userController from "../controllers/userController";
import { upload } from "../../middlewares/multer";

const router = Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.put("/profile", upload.single("avatar"), userController.updateProfile);

export default router;
