import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { createError } from "../../utils/error";
import { errorCode } from "../../../config/errorCode";
import {
  checkCategoryExist,
  checkCategoryIfNotExist,
} from "../../utils/category";
import CacheQueue from "../../jobs/queues/cacheQueue";
import { checkModelIfNotExist } from "../../utils/check";
import { getUserById } from "../../services/authService";
import { checkUserIfNotExist } from "../../utils/auth";
import { getOrSetCache } from "../../utils/cache";
import { getOneCategory } from "../../services/categoryService";
import {
  createOneProductOption,
  deleteOneProductOption,
  getProductOptionById,
  getProductOptionByName,
  ProductOptionArgs,
  updateOneProductOption,
} from "../../services/productOption";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

export const createProductOption = [
  body("name", "Invalid product option name.")
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 50 }),
  body("additionalPrice", "Invalid additional price.")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .toFloat(),
  body("productOptionCategory", "Invalid product option category.")
    .notEmpty()
    .trim()
    .escape(),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { name, additionalPrice, productOptionCategory } = req.body;

    const existingCategory = await getProductOptionByName(
      productOptionCategory,
      name,
    );
    checkCategoryExist(existingCategory);

    const data: ProductOptionArgs = {
      name,
      productOptionCategory,
    };

    if (additionalPrice !== undefined && additionalPrice !== "") {
      data.additionalPrice = additionalPrice;
    }

    const productOption = await createOneProductOption(data);

    await CacheQueue.add(
      "invalidate-product-option-cache",
      {
        pattern: "productOptions:*",
      },
      { jobId: `invalidate-${Date.now()}`, priority: 1 },
    );

    res.status(201).json({
      message: "Successfully created a new product option.",
      productOptionId: productOption.id,
    });
  },
];

export const updateProductOption = [
  body("productOptionId", "Product Option Id is required.").isInt({ min: 1 }),
  body("name", "Invalid product option name.")
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 50 }),
  body("additionalPrice", "Invalud additional price.")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .toFloat(),
  body("productOptionCategory", "Invalid product option category.")
    .notEmpty()
    .trim()
    .escape(),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { productOptionId, name, additionalPrice, productOptionCategory } =
      req.body;

    const productOption = await getProductOptionById(+productOptionId);
    if (!productOption) {
      return next(
        createError("This data model does not exist.", 401, errorCode.invalid),
      );
    }

    const data: any = {
      name,
      additionalPrice,
      productOptionCategory,
    };

    const productOptionUpdated = await updateOneProductOption(
      productOption.id,
      data,
    );

    await CacheQueue.add(
      "invalidate-product-option-category-cache",
      {
        pattern: "productOptions:*",
      },
      { jobId: `invalidate-${Date.now()}`, priority: 1 },
    );

    res.status(200).json({
      message: "Successfully updated a product option.",
      productOptionId: productOptionUpdated.id,
    });
  },
];

export const deleteProductOption = [
  body("productOptionId", "Product Option Id is required.").isInt({ gt: 0 }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { productOptionId } = req.body;
    const user = req.user;

    const productOption = await getProductOptionById(+productOptionId);
    checkModelIfNotExist(productOption);

    const productOptionDeleted = await deleteOneProductOption(
      productOption!.id,
    );

    await CacheQueue.add(
      "invalidate-product-option-category-cache",
      {
        pattern: "productOptions:*",
      },
      { jobId: `invalidate-${Date.now()}`, priority: 1 },
    );

    res.status(200).json({
      message: "Successfully deleted the product option.",
      productOptionId: productOption?.id,
    });
  },
];

// export const getProductOptionCategory = [
//   param("id", "Category ID is required.").isInt({ min: 1 }),
//   async (req: CustomRequest, res: Response, next: NextFunction) => {
//     const errors = validationResult(req).array({ onlyFirstError: true });
//     if (errors.length > 0) {
//       return next(createError(errors[0].msg, 400, errorCode.invalid));
//     }

//     const categoryId = Number(req.params.id);

//     const userId = req.userId;
//     const user = await getUserById(userId!);
//     checkUserIfNotExist(user);

//     const cacheKey = `productOptionCategories:${categoryId}`;
//     const category = await getOrSetCache(cacheKey, async () => {
//       return await getOneProductOptionCategory(+categoryId);
//     });

//     checkCategoryIfNotExist(category);

//     res
//       .status(200)
//       .json({ message: "Product Option Category Detail", category });
//   },
// ];

// export const getProductOptionCategories = [
//   async (req: CustomRequest, res: Response, next: NextFunction) => {
//     const errors = validationResult(req).array({ onlyFirstError: true });
//     if (errors.length > 0) {
//       return next(createError(errors[0].msg, 400, errorCode.invalid));
//     }

//     const userId = req.userId;
//     const user = await getUserById(userId!);
//     checkUserIfNotExist(user);

//     const cacheKey = "productOptionCategories:all";
//     const category = await getOrSetCache(cacheKey, async () => {
//       return await getProductOptionCategoriesList();
//     });

//     res.status(200).json({ message: "Categories List", category });
//   },
// ];
