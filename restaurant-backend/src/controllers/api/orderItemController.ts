import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { error } from "node:console";
import { createError } from "../../utils/error";
import { errorCode } from "../../../config/errorCode";
import { getUserById } from "../../services/authService";
import { checkUserIfNotExist } from "../../utils/auth";
import {
  createOneOrderItem,
  createOrderItemArgs,
  deleteOneOrderItem,
  updateOneOrderItem,
  updateOrderItemArgs,
} from "../../services/orderItemService";
import CacheQueue from "../../jobs/queues/cacheQueue";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

export const createOrderItem = [
  param("orderId", "Order id is required").isInt({ min: 1 }),
  body("menuItemId", "Menu item id is required").isInt({ min: 1 }),
  body("quantity", "Quantity must be at least 1").isInt({ min: 1 }),
  body("productOptionId", "Invalid product option ID.")
    .isInt({ min: 1 })
    .optional(),
  body("note", "Note must be a string with a maximum length of 255 characters.")
    .isString()
    .isLength({ max: 255 })
    .optional(),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const orderId = Number(req.params.orderId);
    const { menuItemId, quantity, note, productOptionId } = req.body;

    const userId = req.userId;
    const user = await getUserById(userId!);
    checkUserIfNotExist(user);

    const data: createOrderItemArgs = {
      orderId,
      menuItemId,
      quantity,
      productOptionId,
      note,
    };

    const orderItem = await createOneOrderItem(data);

    await CacheQueue.add(
      "invalidate-order-item-cache",
      {
        pattern: "orderItems:*",
      },
      { jobId: `invalidate-${Date.now()}`, priority: 1 },
    );

    res.status(201).json({
      message: "Successfully created a new order.",
      orderItem,
    });
  },
];

export const updateOrderItem = [
  param("id", "Order item ID is required.").isInt({ min: 1 }),
  body("quantity", "Quantity must be at least 1.").isInt({ min: 1 }).optional(),
  body("note", "Note must be a string with a maximum length of 255 characters.")
    .isString()
    .isLength({ max: 255 })
    .optional(),
  body("productOptionId", "Invalid product option ID.")
    .isInt({ min: 1 })
    .optional(),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const id = Number(req.params.id);
    const userId = req.userId;
    const user = await getUserById(userId!);
    checkUserIfNotExist(user);

    const { quantity, note, productOptionId } = req.body;

    const data: updateOrderItemArgs = {
      id,
      quantity,
      note,
      productOptionId,
    };

    const updatedItem = await updateOneOrderItem(id, data);

    await CacheQueue.add(
      "invalidate-order-item-cache",
      {
        pattern: "orderItems:*",
      },
      { jobId: `invalidate-${Date.now()}`, priority: 1 },
    );

    res.status(200).json({
      message: "Successfully updated order item.",
      orderItem: updatedItem,
    });
  },
];

export const deleteOrderItem = [
  param("id", "Order item ID is required.").isInt({ min: 1 }),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const id = Number(req.params.id);
    const userId = req.userId;
    const user = await getUserById(userId!);
    checkUserIfNotExist(user);

    await deleteOneOrderItem(id);

    await CacheQueue.add(
      "invalidate-order-item-cache",
      {
        pattern: "orderItems:*",
      },
      { jobId: `invalidate-${Date.now()}`, priority: 1 },
    );

    res.status(200).json({
      message: "Successfully deleted order item.",
    });
  },
];
