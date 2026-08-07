import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { createError } from "../../utils/error";
import { errorCode } from "../../../config/errorCode";
import path from "path";
import { unlink } from "fs/promises";
import { checkModelIfExist, checkUploadFile } from "../../utils/check";
import ImageQueue from "../../jobs/queues/imageQueue";
import CacheQueue from "../../jobs/queues/cacheQueue";
import {
  createOneMenuItem,
  deleteOneMenuItem,
  getMenuItemById,
  MenuItemArgs,
  updateOneMenuItem,
} from "../../services/menuItemService";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
  files?: any;
}

const removeFiles = async (
  originalFile: string,
  optimizedFile: string | null,
) => {
  try {
    const originalFilePath = path.join(
      __dirname,
      "../../..",
      "/uploads/images",
      originalFile,
    );

    await unlink(originalFilePath);

    if (optimizedFile) {
      const optimizedFilePath = path.join(
        __dirname,
        "../../..",
        "/uploads/optimize",
        optimizedFile,
      );
      await unlink(optimizedFilePath);
    }
  } catch (error) {
    console.log(error);
  }
};

export const createMenuItem = [
  body("name", "Invalid menu name.").notEmpty().trim(),
  body("description", "Description is required.").trim(),
  body("price", "Price is required.")
    .isFloat({ min: 0.1 })
    .isDecimal({ decimal_digits: "1,2" }),
  body("isAvailable", "Availability must be a boolean.")
    .notEmpty()
    .isBoolean()
    .toBoolean(),
  body("category", "Category is required.").notEmpty().trim().escape(),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      if (req.file) {
        await removeFiles(req.file.filename, null);
      }
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { name, description, price, isAvailable, category } = req.body;

    checkUploadFile(req.file);

    const splitFileName = req.file?.filename.split(".")[0];

    await ImageQueue.add(
      "optimize-image",
      {
        filePath: req.file?.path,
        fileName: `${splitFileName}.webp`,
        width: 600,
        height: 450,
        quality: 100,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      },
    );

    const data: MenuItemArgs = {
      name,
      description,
      price,
      isAvailable,
      category,
      image: req.file!.filename,
    };

    const menuItem = await createOneMenuItem(data);

    await CacheQueue.add(
      "invalidate-menuItem-cache",
      {
        pattern: "menuItems:*",
      },
      {
        jobId: `invalidate-${Date.now()}`,
        priority: 1,
      },
    );

    res.status(201).json({
      message: "Successfully created a new menu item.",
      menuItemId: menuItem.id,
    });
  },
];

export const updateMenuItem = [
  body("menuItemId", "Menu Item Id is required.").isInt({ min: 1 }),
  body("name", "Invalid menu name.").notEmpty().trim(),
  body("description", "Description is required.").trim(),
  body("price", "Price is required.")
    .isFloat({ min: 0.1 })
    .isDecimal({ decimal_digits: "1,2" }),
  body("isAvailable", "Availability must be a boolean.")
    .notEmpty()
    .isBoolean()
    .toBoolean(),
  body("category", "Category is required.").notEmpty().trim().escape(),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      if (req.file) {
        await removeFiles(req.file.filename, null);
      }
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { menuItemId, name, description, price, isAvailable, category } =
      req.body;

    const menuItem = await getMenuItemById(+menuItemId);
    if (!menuItem) {
      if (req.file) {
        await removeFiles(req.file.filename, null);
      }
      return next(
        createError("This data model does not exist.", 401, errorCode.invalid),
      );
    }

    const data: any = {
      name,
      description,
      price,
      isAvailable,
      category,
      image: req.file,
    };

    if (req.file) {
      data.image = req.file.filename;

      const splitFileName = req.file.filename.split(".")[0];

      await ImageQueue.add(
        "optimize-image",
        {
          filePath: req.file?.path,
          fileName: `${splitFileName}.webp`,
          width: 600,
          height: 450,
          quality: 100,
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
        },
      );

      const optimizedFile = menuItem.image.split(".")[0] + ".webp";
      await removeFiles(menuItem.image, optimizedFile);
    }

    const menuItemUpdated = await updateOneMenuItem(menuItem.id, data);
    await CacheQueue.add(
      "invalidate-menuItem-cache",
      {
        pattern: "menuItems:*",
      },
      {
        jobId: `invalidate-${Date.now()}`,
        priority: 1,
      },
    );

    res.status(200).json({
      message: "Successfully updated a menu item.",
      menuItemId: menuItemUpdated.id,
    });
  },
];

export const deleteMenuItem = [
  body("menuItemId", "Menu item Id is required.").isInt({ gt: 0 }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { menuItemId } = req.body;
    const user = req.user;

    const menuItem = await getMenuItemById(+menuItemId);
    checkModelIfExist(menuItem);

    const postDeleted = await deleteOneMenuItem(menuItem!.id);
    const optimizedFile = menuItem!.image.split(".")[0] + ".webp";
    await removeFiles(menuItem!.image, optimizedFile);

    await CacheQueue.add(
      "invalidate-post-cache",
      {
        pattern: "posts:*",
      },
      {
        jobId: `invalidate-${Date.now()}`,
        priority: 1,
      },
    );

    res.status(200).json({
      message: "Successfully deleted the menu item.",
      menuItemId: menuItem?.id,
    });
  },
];
