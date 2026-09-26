import { Request, Response, NextFunction } from "express";
import { createError } from "../../utils/error";
import { errorCode } from "../../../config/errorCode";
import { verifyRestaurantTableByQrCode } from "../../services/qrVerifyService";
import { TableStatus } from "../../generated/prisma/enums";
import {
  createOneOrder,
  getOrderByTableId,
} from "../../services/orderService";
import CacheQueue from "../../jobs/queues/cacheQueue";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

export const verifyRestaurantTable = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.params;

    if (!token || typeof token !== "string") {
      return next(
        createError("QR code token is required.", 400, errorCode.invalid),
      );
    }

    const restaurantTable = await verifyRestaurantTableByQrCode(
      token as string,
    );

    // No login for customers — scanning the QR code both identifies the
    // table and opens (or resumes) that table's order, which acts as the
    // whole "session" for the rest of the ordering flow.
    let order = await getOrderByTableId(restaurantTable.id);
    let tableStatus = restaurantTable.status;

    if (!order) {
      order = await createOneOrder({ tableId: restaurantTable.id });
      tableStatus = TableStatus.OCCUPIED;

      await CacheQueue.add(
        "invalidate-order-cache",
        { pattern: "orders:*" },
        { jobId: `invalidate-${Date.now()}`, priority: 1 },
      );
      await CacheQueue.add(
        "invalidate-restaurant-table-cache",
        { pattern: "restaurantTables:*" },
        { jobId: `invalidate-${Date.now()}-tables`, priority: 1 },
      );
    }

    res.status(200).json({
      message: "QR code is valid.",
      data: {
        tableId: restaurantTable.id,
        tableNumber: restaurantTable.tableNumber,
        status: tableStatus,
        orderId: order.id,
      },
    });
  } catch (error) {
    next(error);
  }
};
