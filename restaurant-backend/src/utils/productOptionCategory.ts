import { errorCode } from "../../config/errorCode";

export const checkCategoryExist = (category: any) => {
  if (category) {
    const error: any = new Error("Category already exists.");
    error.status = 409;
    error.code = errorCode.invalid;
    throw error;
  }
};

export const checkCategoryIfNotExist = (category: unknown) => {
  if (!category) {
    const error: any = new Error("Category not found.");
    error.status = 404;
    error.code = errorCode.invalid;
    throw error;
  }
};
