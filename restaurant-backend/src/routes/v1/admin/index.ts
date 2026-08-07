import express from "express";
import upload from "../../../middlewares/uploadFile";

import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from "../../../controllers/admin/categoryController";
import {
  createMenuItem,
  deleteMenuItem,
  updateMenuItem,
} from "../../../controllers/admin/menuItemController";

const router = express.Router();

// CRUD for Categories
router.post("/categories", createCategory);
router.get("/categories", getCategories);
router.get("/categories/:id", getCategory);
router.patch("/categories", updateCategory);
router.delete("/categories", deleteCategory);

// CRUD for Menu Items
router.post("/menu-items", upload.single("image"), createMenuItem);
// router.get("/menu-items", getCategories);
// router.get("/menu-item/:id", getCategory);
router.patch("/menu-items", upload.single("image"), updateMenuItem);
router.delete("/menu-items", deleteMenuItem);

export default router;
