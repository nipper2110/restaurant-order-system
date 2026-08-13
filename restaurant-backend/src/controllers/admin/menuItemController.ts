import { Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import { createError } from "../../utils/error";
import { errorCode } from "../../../config/errorCode";
import path from "path";
import { unlink } from "fs/promises";
import {
  checkModelIfExist,
  checkModelIfNotExist,
  checkUploadFile,
} from "../../utils/check";
import ImageQueue from "../../jobs/queues/imageQueue";
import CacheQueue from "../../jobs/queues/cacheQueue";
import {
  createOneMenuItem,
  deleteOneMenuItem,
  getMenuItemById,
  getMenuItemByName,
  getMenuItemList,
  getOneMenuItem,
  MenuItemArgs,
  updateOneMenuItem,
} from "../../services/menuItemService";
import { getUserById } from "../../services/authService";
import { checkUserIfNotExist } from "../../utils/auth";
import { getOrSetCache } from "../../utils/cache";

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
    const cleanName = path.basename(originalFile).split(".")[0];

    const fs = require("fs");
    const imagesDir = path.join(__dirname, "../../..", "uploads", "images");
    const files = fs.readdirSync(imagesDir);

    for (const file of files) {
      if (file.startsWith(cleanName)) {
        await unlink(path.join(imagesDir, file));
      }
    }

    if (optimizedFile) {
      const cleanOptimizedName = path.basename(optimizedFile);
      const optimizedFilePath = path.join(
        __dirname,
        "../../..",
        "uploads",
        "optimize",
        cleanOptimizedName,
      );
      await unlink(optimizedFilePath);
    }
    console.log("Successfully deleted old files from both folders!");
  } catch (error) {
    console.log("Error removing file:", error);
  }
};

export const createMenuItem = [
  body("name", "Invalid menu name.").notEmpty().trim(),
  body("description", "Description is required.").trim(),
  body("price", "Price is required.")
    .isFloat({ min: 0.1 })
    .isDecimal({ decimal_digits: "1,2" }),
  body("isAvailable", "Availabi   lity must be a boolean.")
    .notEmpty()
    .isBoolean()
    .toBoolean(),
  body("category", "Category is required.").notEmpty().trim().escape(),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req).array({ onlyFirstError: true });
      if (errors.length > 0) {
        if (req.file) {
          await removeFiles(req.file.filename, null);
        }
        return next(createError(errors[0].msg, 400, errorCode.invalid));
      }

      const { name, description, price, isAvailable, category } = req.body;

      checkUploadFile(req.file);

      const data: MenuItemArgs = {
        name,
        description,
        price,
        isAvailable,
        category,
        image: req.file!.filename,
      };

      const existingMenuItem = await getMenuItemByName(data.name);
      checkModelIfExist(existingMenuItem);

      const menuItem = await createOneMenuItem(data);

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
    } catch (error) {
      if (req.file) {
        await removeFiles(req.file.filename, null);
      }
      next(error);
    }
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
    try {
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
          createError(
            "This data model does not exist.",
            401,
            errorCode.invalid,
          ),
        );
      }

      const existingMenuItem = await getMenuItemByName(name);
      if (existingMenuItem && existingMenuItem.id !== +menuItemId) {
        if (req.file) {
          await removeFiles(req.file.filename, null);
        }
        return next(
          createError("Menu item name already exists.", 400, errorCode.invalid),
        );
      }

      const data: any = {
        name,
        description,
        price,
        isAvailable,
        category,
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

        if (menuItem.image) {
          const baseName = menuItem.image.split(".")[0];
          const oldOptimizedImage = `${baseName}.webp`;
          await removeFiles(menuItem.image, oldOptimizedImage);
        }
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
    } catch (error) {
      if (req.file) {
        const splitFileName = req.file.filename.split(".")[0];
        await removeFiles(req.file.filename, `${splitFileName}.webp`);
      }
      next(error);
    }
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
    checkModelIfNotExist(menuItem);

    const postDeleted = await deleteOneMenuItem(menuItem!.id);
    const optimizedFile = menuItem!.image.split(".")[0] + ".webp";
    await removeFiles(menuItem!.image, optimizedFile);

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
      message: "Successfully deleted the menu item.",
      menuItemId: menuItem?.id,
    });
  },
];

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
