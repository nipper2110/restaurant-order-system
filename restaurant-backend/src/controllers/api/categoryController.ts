import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { createError } from "../../utils/error";
import { errorCode } from "../../../config/errorCode";
import { getUserById } from "../../services/authService";
import { checkUserIfNotExist } from "../../utils/auth";
import { getOrSetCache } from "../../utils/cache";
import { getCategoriesList, getOneCategory } from "../../services/postService";
import { checkCategoryIfNotExist } from "../../utils/category";

interface CustomRequest extends Request {
  userId?: number;
}

export const getCategory = [
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

    const cacheKey = `categories:${categoryId}`;
    const category = await getOrSetCache(cacheKey, async () => {
      return await getOneCategory(+categoryId);
    });

    checkCategoryIfNotExist(category);

    res.status(200).json({ message: "Category Detail", category });
  },
];

export const getCategories = [
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const userId = req.userId;
    const user = await getUserById(userId!);
    checkUserIfNotExist(user);

    const cacheKey = "categories:all";
    const category = await getOrSetCache(cacheKey, async () => {
      return await getCategoriesList();
    });

    res.status(200).json({ message: "Categories List", category });
  },
];
