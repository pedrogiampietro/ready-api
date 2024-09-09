import { Router } from "express";
import * as userController from "../controllers/userController";
import { upload } from "../../middlewares/multer";
import { authenticateJWT } from "../../middlewares/jwt";

const router = Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/google", userController.googleLogin);
router.put(
  "/profile",
  authenticateJWT,
  upload.single("avatar"),
  userController.updateProfile
);
router.post("/forgot-password", userController.forgotPassword);
router.post("/verify-code", userController.verifyResetPasswordCode);
router.post("/reset-password", userController.resetPassword);

export default router;
