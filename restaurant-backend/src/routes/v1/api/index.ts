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
import {
  createOrder,
  getOrder,
  getOrders,
} from "../../../controllers/api/orderController";
import { auth } from "../../../middlewares/auth";
import {
  createOrderItem,
  deleteOrderItem,
  updateOrderItem,
} from "../../../controllers/api/orderItemController";

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
router.get("/product-options", getProductOptions);
router.get("/product-options/:id", getProductOption);

// For QR Verify
router.get("/tables/qr-codes/verify/:token", verifyRestaurantTable);

// For Order
router.post("/orders", createOrder);
router.get("/orders", getOrders);
router.get("/orders/:id", auth, getOrder);

// For Order Item
router.post("/orders/items/:orderId", createOrderItem);
router.patch("/orders/items/:id", updateOrderItem);
router.delete("/orders/items/:id", deleteOrderItem);
// router.get("/orders-items", getOrders);
// router.get("/orders-items/:id", auth, getOrder);

export default router;
