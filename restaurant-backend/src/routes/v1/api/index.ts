import express from "express";
import {
  getCategories,
  getCategory,
} from "../../../controllers/api/categoryController";
import { auth } from "../../../middlewares/auth";
import {
  getMenuItem,
  getMenuItems,
} from "../../../controllers/api/menuItemController";

const router = express.Router();

// For Categoruies
router.get("/categories", auth, getCategories);
router.get("/categories/:id", auth, getCategory);

// For Menu Items
router.get("/menu-items", auth, getMenuItems);
router.get("/menu-items/:id", auth, getMenuItem);

export default router;
