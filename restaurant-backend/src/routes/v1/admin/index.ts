import express from "express";
import { createCategory } from "../../../controllers/admin/categoryController";

const router = express.Router();

// CRUD for Categories
router.post("/categories", createCategory);
// router.get("/categories", getCategories);
// router.get("/categories/:id", getCategory);
// router.patch("/categories", updateCategory);
// router.delete("/categories", deleteCategory);

export default router;
