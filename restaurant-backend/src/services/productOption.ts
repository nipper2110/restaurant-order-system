import { errorCode } from "../../config/errorCode";
import { prisma } from "../lib/prisma";
import { createError } from "../utils/error";

export type ProductOptionArgs = {
  name: string;
  additionalPrice?: number;
  productOptionCategory: string;
};

export const createOneProductOption = async (
  productOptionData: ProductOptionArgs,
) => {
  const category = await prisma.productOptionCategory.findFirst({
    where: { name: productOptionData.productOptionCategory },
  });

  if (!category) {
    throw createError(
      "Product option category does not exist.",
      400,
      errorCode.invalid,
    );
  }

  const data: any = {
    name: productOptionData.name,
    additionalPrice: productOptionData.additionalPrice,
    productOptionCategory: {
      connect: {
        id: category.id,
      },
    },
  };

  return prisma.productOption.create({
    data,
  });
};

export const getProductOptionByName = async (
  productOptionCategoryName: string,
  productOptionName: string,
) => {
  const productOptionCategory = await prisma.productOptionCategory.findFirst({
    where: { name: productOptionCategoryName },
  });

  if (!productOptionCategory) {
    throw createError(
      "Product option category is not existed.",
      400,
      errorCode.invalid,
    );
  }

  return prisma.productOption.findUnique({
    where: {
      productOptionCategoryId_name: {
        productOptionCategoryId: productOptionCategory.id,
        name: productOptionName,
      },
    },
  });
};

export const getProductOptionById = async (id: number) => {
  return prisma.productOption.findUnique({
    where: { id },
  });
};

export const updateOneProductOption = async (
  id: number,
  Data: ProductOptionArgs,
) => {
  const category = await prisma.productOptionCategory.findFirst({
    where: { name: Data.productOptionCategory },
  });

  if (!category) {
    throw createError(
      "Product option category does not exist.",
      400,
      errorCode.invalid,
    );
  }

  const existingProductOption = await prisma.productOption.findFirst({
    where: {
      name: Data.name,
      productOptionCategoryId: category.id,
      NOT: {
        id,
      },
    },
  });

  if (existingProductOption) {
    throw createError(
      "Product option already exists in this category.",
      409,
      errorCode.productOptionExist,
    );
  }

  const data: any = {
    name: Data.name,
    additionalPrice: Data.additionalPrice,
    productOptionCategory: {
      connect: {
        id: category.id,
      },
    },
  };
  return prisma.productOption.update({
    where: { id },
    data,
  });
};

export const deleteOneProductOption = async (id: number) => {
  return prisma.productOption.delete({
    where: { id },
  });
};

export const getOneProductOption = async (id: number) => {
  return prisma.productOption.findUnique({
    where: { id },
  });
};

export const getProductOptionsList = async () => {
  return prisma.productOption.findMany({
    orderBy: {
      id: "asc",
    },
  });
};
