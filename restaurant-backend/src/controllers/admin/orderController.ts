import { Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import { createError } from "../../utils/error";
import { errorCode } from "../../../config/errorCode";
import CacheQueue from "../../jobs/queues/cacheQueue";
import { checkModelIfNotExist } from "../../utils/check";
import { getUserById } from "../../services/authService";
import { checkUserIfNotExist } from "../../utils/auth";
import { getOrSetCache } from "../../utils/cache";
import {
  createOneOrder,
  getOneOrder,
  getOrderByTableId,
  getOrderList,
  orderArgs,
} from "../../services/orderService";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

export const createOrder = [
  body("tableId", "Invalid table ID.").isInt({ min: 1 }),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { tableId } = req.body;

    const existingOrder = await getOrderByTableId(tableId);
    if (existingOrder) {
      return next(
        createError(
          "Order is already existed in the table id",
          409,
          errorCode.invalid,
        ),
      );
    }

    const data: orderArgs = {
      tableId,
    };

    const order = await createOneOrder(data);

    await CacheQueue.add(
      "invalidate-order-cache",
      {
        pattern: "orders:*",
      },
      { jobId: `invalidate-${Date.now()}`, priority: 1 },
    );

    res.status(201).json({
      message: "Successfully created a new order.",
      orderId: order.id,
    });
  },
];

export const getOrder = [
  param("id", "Order ID is required.").isInt({ min: 1 }),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const orderId = Number(req.params.id);

    const userId = req.userId;
    const user = await getUserById(userId!);
    checkUserIfNotExist(user);

    const cacheKey = `orders:${orderId}`;
    const order = await getOrSetCache(cacheKey, async () => {
      return await getOneOrder(+orderId);
    });

    checkModelIfNotExist(order);

    res.status(200).json({ message: "Order Detail", order });
  },
];

// // Cursor-based Pagination
export const getOrders = [
  query("cursor", "Cursor must be Menu Item ID.").isInt({ gt: 0 }).optional(),
  query("limit", "Limit number must be unsigned integer.")
    .isInt({ gt: 2 })
    .optional(),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const lastCursor = req.query.cursor;
    const limit = req.query.limit || 5;

    const orderId = Number(req.params.id);

    const userId = req.userId;
    const user = await getUserById(userId!);
    checkUserIfNotExist(user);

    const options = {
      take: +limit + 1,
      skip: lastCursor ? 1 : 0,
      cursor: lastCursor ? { id: +lastCursor } : undefined,
      select: {
        id: true,
        totalPrice: true,
        createdAt: true,
        tableId: true,
        table: {
          select: {
            id: true,
            tableNumber: true,
            status: true,
          },
        },
        orderItems: true,
      },
      orderBy: {
        id: "desc",
      },
    };

    const cacheKey = `orders:${JSON.stringify(req.query)}`;
    const orders = await getOrSetCache(cacheKey, async () => {
      return await getOrderList(options);
    });

    const hasNextPage = orders.length > +limit; // > 5

    if (hasNextPage) {
      orders.pop();
    }

    const nextCursor = orders.length > 0 ? orders[orders.length - 1].id : null;

    checkModelIfNotExist(orders);

    res.status(200).json({
      message: "Get All infinite orders.",
      hasNextPage,
      nextCursor,
      prevCursor: lastCursor,
      orders: orders,
    });
  },
];
