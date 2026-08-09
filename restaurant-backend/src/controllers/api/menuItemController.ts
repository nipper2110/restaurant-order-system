import { Request, Response, NextFunction } from "express";
import { param, query, validationResult } from "express-validator";
import { createError } from "../../utils/error";
import { errorCode } from "../../../config/errorCode";
import { checkModelIfNotExist, checkUploadFile } from "../../utils/check";

import {
  getMenuItemList,
  getOneMenuItem,
} from "../../services/menuItemService";
import { getUserById } from "../../services/authService";
import { checkUserIfNotExist } from "../../utils/auth";
import { getOrSetCache } from "../../utils/cache";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
  files?: any;
}

export const getMenuItem = [
  param("id", "Menu item ID is required.").notEmpty().isInt({ min: 1 }),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const menuItemId = Number(req.params.id);

    const userId = req.userId;
    const user = await getUserById(userId!);
    checkUserIfNotExist(user);

    const cacheKey = `menuItems:${menuItemId}`;
    const menuItem = await getOrSetCache(cacheKey, async () => {
      return await getOneMenuItem(+menuItemId);
    });

    checkModelIfNotExist(menuItem);

    res.status(200).json({ message: "Menu Item Detail", menuItem });
  },
];

// Cursor-based Pagination
export const getMenuItems = [
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

    const menuItemId = Number(req.params.id);

    const userId = req.userId;
    const user = await getUserById(userId!);
    checkUserIfNotExist(user);

    const options = {
      take: +limit + 1,
      skip: lastCursor ? 1 : 0,
      cursor: lastCursor ? { id: +lastCursor } : undefined,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        isAvailable: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    };

    const cacheKey = `menuItems:${JSON.stringify(req.query)}`;
    const menuItems = await getOrSetCache(cacheKey, async () => {
      return await getMenuItemList(options);
    });

    const hasNextPage = menuItems.length > +limit; // > 5

    if (hasNextPage) {
      menuItems.pop();
    }

    const nextCursor =
      menuItems.length > 0 ? menuItems[menuItems.length - 1].id : null;

    checkModelIfNotExist(menuItems);

    res.status(200).json({
      message: "Get All infinite menu items.",
      hasNextPage,
      nextCursor,
      prevCursor: lastCursor,
      menuItems,
    });
  },
];
