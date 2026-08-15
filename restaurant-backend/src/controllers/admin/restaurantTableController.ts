import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { createError } from "../../utils/error";
import { errorCode } from "../../../config/errorCode";
import {
  checkCategoryExist,
  checkCategoryIfNotExist,
} from "../../utils/category";

import CacheQueue from "../../jobs/queues/cacheQueue";
import { checkModelIfExist, checkModelIfNotExist } from "../../utils/check";
import { getUserById } from "../../services/authService";
import { checkUserIfNotExist } from "../../utils/auth";
import { getOrSetCache } from "../../utils/cache";
import { getOneCategory } from "../../services/categoryService";
import {
  createOneRestaurantTable,
  deleteOneRestaurantTable,
  getOneRestaurantTable,
  getRestaurantTableById,
  getRestaurantTableByNumber,
  getRestaurantTableByQrCode,
  getRestaurantTableList,
  RestaurantTableArgs,
  updateOneRestaurantTable,
} from "../../services/restaurantTableService";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

export const createRestaurantTable = [
  body("tableNumber", "Invalid table number.").isInt({ min: 1 }),
  body("qrCode", "QR code is required.").notEmpty().isString().trim(),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { tableNumber, qrCode } = req.body;

    const existingTable = await getRestaurantTableByNumber(tableNumber);
    if (existingTable) {
      return next(
        createError("The table is already existed.", 409, errorCode.invalid),
      );
    }

    const existingQrCode = await getRestaurantTableByQrCode(qrCode);
    if (existingQrCode) {
      return next(
        createError("QR code is already existed.", 409, errorCode.invalid),
      );
    }

    const data: RestaurantTableArgs = {
      tableNumber,
      qrCode,
    };

    const restaurantTable = await createOneRestaurantTable(data);

    await CacheQueue.add(
      "invalidate-restaurant-table-cache",
      {
        pattern: "restaurantTables:*",
      },
      { jobId: `invalidate-${Date.now()}`, priority: 1 },
    );

    res.status(201).json({
      message: "Successfully created a new restaurant table.",
      restaurantTableId: restaurantTable.id,
    });
  },
];

export const updateRestaurantTable = [
  body("tableId", "Table Id is required.").isInt({ min: 1 }),
  body("tableNumber", "Invalid table number.").isInt({ min: 1 }),
  body("qrCode", "QR code is required.").notEmpty().isString().trim(),
  body("status", "Status is invalid")
    .optional()
    .isIn(["AVAILABLE", "OCCUPIED"]),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { tableId, tableNumber, qrCode, status } = req.body;

    const restaurantTable = await getRestaurantTableById(+tableId);
    if (!restaurantTable) {
      return next(
        createError("This data model does not exist.", 401, errorCode.invalid),
      );
    }

    const data: any = {
      tableNumber,
      qrCode,
      status,
    };

    const restaurantTableUpdated = await updateOneRestaurantTable(
      restaurantTable.id,
      data,
    );

    await CacheQueue.add(
      "invalidate-restaurant-table-cache",
      {
        pattern: "restaurantTables:*",
      },
      { jobId: `invalidate-${Date.now()}`, priority: 1 },
    );

    res.status(200).json({
      message: "Successfully updated a restaurant table.",
      restaurantTableId: restaurantTableUpdated.id,
    });
  },
];

export const deleteRestaurantTable = [
  body("tableId", "Table Id is required.").isInt({ gt: 0 }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { tableId } = req.body;
    const user = req.user;

    const restaurantTable = await getRestaurantTableById(+tableId);
    checkModelIfNotExist(restaurantTable);

    const restaurantTableDeleted = await deleteOneRestaurantTable(
      restaurantTable!.id,
    );

    await CacheQueue.add(
      "invalidate-restaurant-table-cache",
      {
        pattern: "restaurantTables:*",
      },
      { jobId: `invalidate-${Date.now()}`, priority: 1 },
    );

    res.status(200).json({
      message: "Successfully deleted the restaurant table.",
      restaurantTableId: restaurantTable?.id,
    });
  },
];

export const getRestaurantTable = [
  param("id", "Table ID is required.").isInt({ min: 1 }),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const restaurantTableId = Number(req.params.id);

    const userId = req.userId;
    const user = await getUserById(userId!);
    checkUserIfNotExist(user);

    const cacheKey = `restaurantTables:${restaurantTableId}`;
    const restaurantTable = await getOrSetCache(cacheKey, async () => {
      return await getOneRestaurantTable(+restaurantTableId);
    });

    checkModelIfNotExist(restaurantTable);

    res
      .status(200)
      .json({ message: "Restaurant Table Detail", restaurantTable });
  },
];

export const getRestaurantTables = [
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const userId = req.userId;
    const user = await getUserById(userId!);
    checkUserIfNotExist(user);

    const cacheKey = "restaurantTables:all";
    const restaurantTable = await getOrSetCache(cacheKey, async () => {
      return await getRestaurantTableList();
    });

    res.status(200).json({ message: "Restaurant Table List", restaurantTable });
  },
];
