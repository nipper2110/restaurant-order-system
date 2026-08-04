import express from "express";
import {
  confirmPassword,
  login,
  logout,
  register,
  verifyOtp,
} from "../../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/confirm-password", confirmPassword);
router.post("/login", login);
router.post("/logout", logout);

// router.post("/change-password");

// router.get("/auth-check");

export default router;
