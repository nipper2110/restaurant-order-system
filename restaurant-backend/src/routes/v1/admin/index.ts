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
  getMenuItem,
  getMenuItems,
  updateMenuItem,
} from "../../../controllers/admin/menuItemController";
import { auth } from "../../../middlewares/auth";

const router = express.Router();

// CRUD for Categories
router.post("/categories", createCategory);
router.get("/categories", auth, getCategories);
router.get("/categories/:id", auth, getCategory);
router.patch("/categories", updateCategory);
router.delete("/categories", deleteCategory);

// CRUD for Menu Items
router.post("/menu-items", upload.single("image"), createMenuItem);
router.get("/menu-items", auth, getMenuItems);
router.get("/menu-items/:id", auth, getMenuItem);
router.patch("/menu-items", upload.single("image"), updateMenuItem);
router.delete("/menu-items", deleteMenuItem);

export default router;
