import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { createError } from "../../utils/error";
import { errorCode } from "../../../config/errorCode";
import {
  CategoryArgs,
  createOneCategory,
  deleteOneCategory,
  getCategoriesList,
  getCategoryById,
  getCategoryByName,
  getOneCategory,
  updateOneCategory,
} from "../../services/categoryService";
import {
  checkCategoryExist,
  checkCategoryIfNotExist,
} from "../../utils/category";
import CacheQueue from "../../jobs/queues/cacheQueue";
import { getUserById } from "../../services/authService";
import { checkUserIfNotExist } from "../../utils/auth";
import { getOrSetCache } from "../../utils/cache";

interface CustomRequest extends Request {
  userId?: number;
}

export const createCategory = [
  body("name", "Invalid category name.")
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 50 }),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const name = req.body.name;

    const existingCategory = await getCategoryByName(name);
    checkCategoryExist(existingCategory);

    const data: CategoryArgs = {
      name,
    };

    const category = await createOneCategory(data);

    await CacheQueue.add(
      "invalidate-category-cache",
      {
        pattern: "categories:*",
      },
      { jobId: `invalidate-${Date.now()}`, priority: 1 },
    );

    res.status(201).json({
      message: "Successfully created a new category.",
      categoryId: category.id,
    });
  },
];

export const updateCategory = [
  body("categoryId", "Category Id is required.").isInt({ min: 1 }),
  body("name", "Invalid category name.")
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 50 }),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { categoryId, name } = req.body;

    const category = await getCategoryById(+categoryId);
    checkCategoryIfNotExist(category);

    const existingCategory = await getCategoryByName(name);
    checkCategoryExist(existingCategory);

    const data: CategoryArgs = {
      name,
    };

    const categoryUpdated = await updateOneCategory(category!.id, data);

    await CacheQueue.add(
      "invalidate-category-cache",
      {
        pattern: "categories:*",
      },
      { jobId: `invalidate-${Date.now()}`, priority: 1 },
    );

    res.status(200).json({
      message: "Successfully updated the category.",
      categoryId: categoryUpdated.id,
    });
  },
];

export const deleteCategory = [
  body("categoryId", "Category Id is required.").isInt({ min: 1 }),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { categoryId } = req.body;

    const category = await getCategoryById(+categoryId);
    checkCategoryIfNotExist(category);

    const categoryDeleted = await deleteOneCategory(category!.id);

    await CacheQueue.add(
      "invalidate-category-cache",
      {
        pattern: "categories:*",
      },
      { jobId: `invalidate-${Date.now()}`, priority: 1 },
    );

    res.status(200).json({
      message: "Successfully deleted the category.",
      categoryId: category?.id,
    });
  },
];

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
