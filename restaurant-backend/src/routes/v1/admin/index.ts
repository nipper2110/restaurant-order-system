import express from "express";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../../../controllers/admin/categoryController";

const router = express.Router();

// CRUD for Categories
router.post("/categories", createCategory);
// router.get("/categories", getCategories);
// router.get("/categories/:id", getCategory);
router.patch("/categories", updateCategory);
router.delete("/categories", deleteCategory);

export default router;
