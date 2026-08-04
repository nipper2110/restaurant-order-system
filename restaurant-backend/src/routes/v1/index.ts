import express from "express";

import healthRoutes from "./health";
import authRoutes from "./auth";
import adminRoutes from "./admin/index";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.use("/api/v1", healthRoutes);
router.use("/api/v1", authRoutes);
router.use("/api/v1/admins", auth, adminRoutes);

export default router;
