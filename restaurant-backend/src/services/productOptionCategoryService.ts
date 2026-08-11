import { prisma } from "../lib/prisma";

export type ProductOptionCategoryArgs = {
  name: string;
  isRequired: boolean;
  menuItem: string;
};

export const createOneProductOptionCategory = async (
  categoryData: ProductOptionCategoryArgs,
) => {
  const data: any = {
    name: categoryData.name,
    isRequired: categoryData.isRequired,
    menuItem: {
      connect: {
        name: categoryData.menuItem,
      },
    },
  };

  return prisma.productOptionCategory.create({
    data,
  });
};

// export const getProductOptionCategoryByName = async (name: string) => {
//   return prisma.productOptionCategory.findUnique({
//     where: { name },
//   });
// };

export const getProductOptionCategoryById = async (id: number) => {
  return prisma.productOptionCategory.findUnique({
    where: { id },
  });
};

export const updateOneProductOptionCategory = async (
  id: number,
  categoryData: ProductOptionCategoryArgs,
) => {
  const data: any = {
    name: categoryData.name,
    isRequired: categoryData.isRequired,
    menuItem: {
      connect: {
        name: categoryData.menuItem,
      },
    },
  };
  return prisma.productOptionCategory.update({
    where: { id },
    data,
  });
};

export const deleteOneProductOptionCategory = async (id: number) => {
  return prisma.productOptionCategory.delete({
    where: { id },
  });
};

export const getOneProductOptionCategory = async (id: number) => {
  return prisma.productOptionCategory.findUnique({
    where: { id },
  });
};

export const getProductOptionCategoriesList = async () => {
  return prisma.productOptionCategory.findMany();
};
