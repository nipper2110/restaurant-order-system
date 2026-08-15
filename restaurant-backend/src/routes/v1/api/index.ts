import express from "express";
import {
  getCategories,
  getCategory,
} from "../../../controllers/api/categoryController";
import {
  getMenuItem,
  getMenuItems,
} from "../../../controllers/api/menuItemController";
import {
  getProductOptionCategories,
  getProductOptionCategory,
} from "../../../controllers/api/productOptionCategoryController";
import {
  getProductOption,
  getProductOptions,
} from "../../../controllers/api/productOptionController";
import { verifyRestaurantTable } from "../../../controllers/api/qrVerifyController";

const router = express.Router();

// For Categoruies
router.get("/categories", getCategories);
router.get("/categories/:id", getCategory);

// For Menu Items
router.get("/menu-items", getMenuItems);
router.get("/menu-items/:id", getMenuItem);

// For Product Option Category
router.get("/product-option-categories", getProductOptionCategories);
router.get("/product-option-categories/:id", getProductOptionCategory);

// For Product Option
router.get("/product-option", getProductOptions);
router.get("/product-option/:id", getProductOption);

// For QR Verify
router.get("/tables/qr-codes/verify/:token", verifyRestaurantTable);

export default router;
