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
import {
  createProductOptionCategory,
  deleteProductOptionCategory,
  getProductOptionCategories,
  getProductOptionCategory,
  updateProductOptionCategory,
} from "../../../controllers/admin/productOptionCategoryController";
import {
  createProductOption,
  deleteProductOption,
  getProductOption,
  getProductOptions,
  updateProductOption,
} from "../../../controllers/admin/productOptionController";
import {
  createRestaurantTable,
  deleteRestaurantTable,
  getRestaurantTable,
  getRestaurantTables,
  updateRestaurantTable,
} from "../../../controllers/admin/restaurantTableController";
import {
  createOrder,
  getOrder,
  getOrders,
} from "../../../controllers/admin/orderController";

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

// CRUD for Product Option Category
router.post("/product-option-categories", createProductOptionCategory);
router.get("/product-option-categories", auth, getProductOptionCategories);
router.get("/product-option-categories/:id", auth, getProductOptionCategory);
router.patch("/product-option-categories", updateProductOptionCategory);
router.delete("/product-option-categories", deleteProductOptionCategory);

// CRUD for Product Option
router.post("/product-options", createProductOption);
router.get("/product-options", auth, getProductOptions);
router.get("/product-options/:id", auth, getProductOption);
router.patch("/product-options", updateProductOption);
router.delete("/product-options", deleteProductOption);

// CRUD for Restaurant Table
router.post("/restaurant-tables", createRestaurantTable);
router.get("/restaurant-tables", auth, getRestaurantTables);
router.get("/restaurant-tables/:id", auth, getRestaurantTable);
router.patch("/restaurant-tables", updateRestaurantTable);
router.delete("/restaurant-tables", deleteRestaurantTable);

// For Order
router.post("/orders", createOrder);
router.get("/orders", getOrders);
router.get("/orders/:id", getOrder);

export default router;
