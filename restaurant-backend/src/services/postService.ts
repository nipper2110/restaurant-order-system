import { prisma } from "../lib/prisma";

export type CategoryArgs = {
  name: string;
};

export const createOneCategory = async (categoryData: CategoryArgs) => {
  return prisma.category.create({
    data: {
      name: categoryData.name,
    },
  });
};

export const getCategoryByName = async (name: string) => {
  return prisma.category.findUnique({
    where: { name },
  });
};

export const getCategoryById = async (id: number) => {
  return prisma.category.findUnique({
    where: { id },
  });
};

export const updateOneCategory = async (
  id: number,
  categoryData: CategoryArgs,
) => {
  return prisma.category.update({
    where: { id },
    data: categoryData,
  });
};

export const deleteOneCategory = async (id: number) => {
  return prisma.category.delete({
    where: { id },
  });
};
