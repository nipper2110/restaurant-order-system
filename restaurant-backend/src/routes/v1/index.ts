import express from "express";

import healthRoutes from "./health";
import authRoutes from "./auth";
import adminRoutes from "./admin/index";
import userRoutes from "./api/index";
import { auth } from "../../middlewares/auth";
import { authorise } from "../../middlewares/authorise";

const router = express.Router();

router.use("/api/v1", healthRoutes);
router.use("/api/v1", authRoutes);
router.use("/api/v1/admins", auth, authorise(true, "ADMIN"), adminRoutes);
router.use("/api/v1/users", auth, userRoutes);

export default router;
