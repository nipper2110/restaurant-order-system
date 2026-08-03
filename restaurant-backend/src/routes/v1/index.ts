import express from "express";

import healthRoutes from "./health";
import authRoutes from "./auth";

const router = express.Router();

router.use("/api/v1", healthRoutes);
router.use("/api/v1", authRoutes);

export default router;
