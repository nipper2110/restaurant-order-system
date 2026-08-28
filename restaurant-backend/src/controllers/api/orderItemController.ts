import { Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import { createError } from "../../utils/error";
import { errorCode } from "../../../config/errorCode";
import {
  createOneOrderItem,
  createOrderItemArgs,
  deleteOneOrderItem,
  getOneOrderItem,
  getOrderItemList,
  updateOneOrderItem,
  updateOrderItemArgs,
} from "../../services/orderItemService";
import CacheQueue from "../../jobs/queues/cacheQueue";
import { getOrSetCache } from "../../utils/cache";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

export const createOrderItem = [
  param("orderId", "Order id is required").isInt({ min: 1 }),
  body("tableId", "Table ID is required.").isInt({ min: 1 }),
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
    const { menuItemId, quantity, note, productOptionId, tableId } = req.body;

    const data: createOrderItemArgs = {
      orderId,
      menuItemId,
      quantity,
      productOptionId,
      note,
      tableId,
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
      message: "Successfully created a new order item.",
      orderItem,
    });
  },
];

export const updateOrderItem = [
  param("id", "Order item ID is required.").isInt({ min: 1 }),
  body("tableId", "Table ID is required.").isInt({ min: 1 }),
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
    const { quantity, note, productOptionId, tableId } = req.body;

    const data: updateOrderItemArgs = {
      id,
      quantity,
      note,
      productOptionId,
      tableId,
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
  body("tableId", "Table ID is required.").isInt({ min: 1 }),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const id = Number(req.params.id);
    const { tableId } = req.body;

    await deleteOneOrderItem(id, tableId);

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

export const getOrderItem = [
  param("id", "Ordet item ID is required.").isInt({ min: 1 }),
  body("tableId", "Table ID is required.").isInt({ min: 1 }),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const orderItemId = Number(req.params.id);
    const tableId = req.body.tableId;

    const cacheKey = `orderItems:${orderItemId}`;
    const orderItem = await getOrSetCache(cacheKey, async () => {
      return await getOneOrderItem(+orderItemId, tableId);
    });

    res.status(200).json({ message: "Order Item Detail", orderItem });
  },
];

export const getOrderItems = [
  param("orderId", "Order id is required").isInt({ min: 1 }),

  body("tableId", "Table ID is required.").isInt({ min: 1 }),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const orderId = Number(req.params.orderId);
    const tableId = req.body.tableId;

    const cacheKey = "orderItems:all";
    const orderItem = await getOrSetCache(cacheKey, async () => {
      return await getOrderItemList(orderId, tableId);
    });

    res.status(200).json({ message: "Order Items List", orderItem });
  },
];
