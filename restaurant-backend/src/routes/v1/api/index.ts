import express from "express";
import {
  getCategories,
  getCategory,
} from "../../../controllers/api/categoryController";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/categories/:id", getCategory);

export default router;
