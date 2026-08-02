import express from "express";
import healthRoutes from "./health";

const router = express.Router();

router.use("/api/v1", healthRoutes);

export default router;
