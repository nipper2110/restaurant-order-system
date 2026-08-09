import { Request, Response, NextFunction } from "express";
import { param, validationResult } from "express-validator";
import { createError } from "../../utils/error";
import { errorCode } from "../../../config/errorCode";
import { checkCategoryIfNotExist } from "../../utils/category";
import { getUserById } from "../../services/authService";
import { checkUserIfNotExist } from "../../utils/auth";
import { getOrSetCache } from "../../utils/cache";
import {
  getOneProductOptionCategory,
  getProductOptionCategoriesList,
} from "../../services/productOptionCategoryService";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

export const getProductOptionCategory = [
  param("id", "Category ID is required.").isInt({ min: 1 }),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const categoryId = Number(req.params.id);

    const userId = req.userId;
    const user = await getUserById(userId!);
    checkUserIfNotExist(user);

    const cacheKey = `productOptionCategories:${categoryId}`;
    const category = await getOrSetCache(cacheKey, async () => {
      return await getOneProductOptionCategory(+categoryId);
    });

    checkCategoryIfNotExist(category);

    res
      .status(200)
      .json({ message: "Product Option Category Detail", category });
  },
];

export const getProductOptionCategories = [
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const userId = req.userId;
    const user = await getUserById(userId!);
    checkUserIfNotExist(user);

    const cacheKey = "productOptionCategories:all";
    const category = await getOrSetCache(cacheKey, async () => {
      return await getProductOptionCategoriesList();
    });

    res.status(200).json({ message: "Categories List", category });
  },
];
