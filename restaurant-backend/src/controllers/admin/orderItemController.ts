import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { createError } from "../../utils/error";
import { errorCode } from "../../../config/errorCode";
import CacheQueue from "../../jobs/queues/cacheQueue";
import { setOrderItemServed } from "../../services/orderItemService";

export const updateOrderItemServedStatus = [
  param("id", "Order item ID is required.").isInt({ min: 1 }),
  body("isServed", "isServed must be a boolean.").isBoolean().toBoolean(),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const id = Number(req.params.id);
    const { isServed } = req.body;

    const orderItem = await setOrderItemServed(id, isServed);

    await CacheQueue.add(
      "invalidate-order-item-cache",
      { pattern: "orderItems:*" },
      { jobId: `invalidate-${Date.now()}`, priority: 1 },
    );
    await CacheQueue.add(
      "invalidate-order-cache",
      { pattern: "orders:*" },
      { jobId: `invalidate-${Date.now()}-order`, priority: 1 },
    );

    res.status(200).json({
      message: "Successfully updated order item status.",
      orderItem,
    });
  },
];
