import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { createError } from "../../utils/error";
import { errorCode } from "../../../config/errorCode";
import { checkCategoryExist } from "../../utils/category";
import {
  createOneProductOptionCategory,
  deleteOneProductOptionCategory,
  getProductOptionCategoryById,
  getProductOptionCategoryByName,
  ProductOptionCategoryArgs,
  updateOneProductOptionCategory,
} from "../../services/productOptionCategoryService";
import CacheQueue from "../../jobs/queues/cacheQueue";
import { checkModelIfNotExist } from "../../utils/check";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

export const createProductOptionCategory = [
  body("name", "Invalid product option category name.")
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 50 }),
  body("isRequired", "Is required must be a boolean value.")
    .notEmpty()
    .isBoolean()
    .toBoolean(),
  body("menuItem", "Menu Item is required.").notEmpty().trim().escape(),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { name, isRequired, menuItem } = req.body;

    const existingCategory = await getProductOptionCategoryByName(name);
    checkCategoryExist(existingCategory);

    const data: ProductOptionCategoryArgs = {
      name,
      isRequired,
      menuItem,
    };

    const category = await createOneProductOptionCategory(data);

    await CacheQueue.add(
      "invalidate-product-option-category-cache",
      {
        pattern: "productOtpionCategories:*",
      },
      { jobId: `invalidate-${Date.now()}`, priority: 1 },
    );

    res.status(201).json({
      message: "Successfully created a new product option category.",
      categoryId: category.id,
    });
  },
];

export const updateProductOptionCategory = [
  body("categoryId", "Category Id is required.").isInt({ min: 1 }),
  body("name", "Invalid product option category name.")
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 50 }),
  body("isRequired", "Is required must be a boolean value.")
    .notEmpty()
    .isBoolean()
    .toBoolean(),
  body("menuItem", "Menu Item is required.").notEmpty().trim().escape(),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { categoryId, name, isRequired, menuItem } = req.body;

    const category = await getProductOptionCategoryById(+categoryId);
    if (!category) {
      return next(
        createError("This data model does not exist.", 401, errorCode.invalid),
      );
    }

    const data: any = {
      name,
      isRequired,
      menuItem,
    };

    const categoryUpdated = await updateOneProductOptionCategory(
      category.id,
      data,
    );

    await CacheQueue.add(
      "invalidate-product-option-category-cache",
      {
        pattern: "productOtpionCategories:*",
      },
      { jobId: `invalidate-${Date.now()}`, priority: 1 },
    );

    res.status(200).json({
      message: "Successfully updated a product option category.",
      productOptionCategoryId: categoryUpdated.id,
    });
  },
];

export const deleteProductOptionCategory = [
  body("categoryId", "Category Id is required.").isInt({ gt: 0 }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { categoryId } = req.body;
    const user = req.user;

    const category = await getProductOptionCategoryById(+categoryId);
    checkModelIfNotExist(category);

    const categoryDeleted = await deleteOneProductOptionCategory(category!.id);

    await CacheQueue.add(
      "invalidate-product-option-category-cache",
      {
        pattern: "productOtpionCategories:*",
      },
      { jobId: `invalidate-${Date.now()}`, priority: 1 },
    );

    res.status(200).json({
      message: "Successfully deleted the product option category.",
      categoryId: category?.id,
    });
  },
];
