import { Request, Response, NextFunction } from "express";
import { param, query, validationResult } from "express-validator";
import { createError } from "../../utils/error";
import { errorCode } from "../../../config/errorCode";
import { getUserById } from "../../services/authService";
import { checkUserIfNotExist } from "../../utils/auth";
import { getOrSetCache } from "../../utils/cache";
import {
  getOneProductOption,
  getProductOptionsList,
} from "../../services/productOption";
import { checkModelIfNotExist } from "../../utils/check";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

export const getProductOption = [
  param("id", "Product Option ID is required.").isInt({ min: 1 }),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const productOptionId = Number(req.params.id);

    const userId = req.userId;
    const user = await getUserById(userId!);
    checkUserIfNotExist(user);

    const cacheKey = `productOptions:${productOptionId}`;
    const productOption = await getOrSetCache(cacheKey, async () => {
      return await getOneProductOption(+productOptionId);
    });

    checkModelIfNotExist(productOption);

    res.status(200).json({ message: "Product Option Detail", productOption });
  },
];

// Cursor-based Pagination
export const getProductOptions = [
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

    const productOptionId = Number(req.params.id);

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
        additionalPrice: true,
        productOptionCategory: true,
      },
      orderBy: {
        id: "desc",
      },
    };

    const cacheKey = `productOptions:${JSON.stringify(req.query)}`;
    const productOptions = await getOrSetCache(cacheKey, async () => {
      return await getProductOptionsList(options);
    });

    const hasNextPage = productOptions.length > +limit; // > 5

    if (hasNextPage) {
      productOptions.pop();
    }

    const nextCursor =
      productOptions.length > 0
        ? productOptions[productOptions.length - 1].id
        : null;

    checkModelIfNotExist(productOptions);

    res.status(200).json({
      message: "Get All infinite product options.",
      hasNextPage,
      nextCursor,
      prevCursor: lastCursor,
      productOptions: productOptions,
    });
  },
];
