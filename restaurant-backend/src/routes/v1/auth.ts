import express from "express";
import { register } from "../../controllers/authController";

const router = express.Router();

router.post("/register", register);
// router.post("/verify-otp", verifyOtp);
// router.post("/confirm-password", confirmPassword);
// router.post("/login");
// router.post("/logout");

// router.post("/change-password");

// router.get("/auth-check");

export default router;
