import { prisma } from "./prismaClient";

export type MenuItemArgs = {
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  image: string;
  category: string;
};

export const createOneMenuItem = async (menuItemData: MenuItemArgs) => {
  const data: any = {
    name: menuItemData.name,
    description: menuItemData.description,
    price: menuItemData.price,
    isAvailable: menuItemData.isAvailable,
    image: menuItemData.image,
    category: {
      connectOrCreate: {
        where: { name: menuItemData.category },
        create: {
          name: menuItemData.category,
        },
      },
    },
  };

  return prisma.menuItem.create({
    data,
  });
};

export const getMenuItemById = async (id: number) => {
  return prisma.menuItem.findUnique({
    where: { id },
  });
};

export const getMenuItemByName = async (name: string) => {
  return prisma.menuItem.findUnique({
    where: { name },
  });
};

export const updateOneMenuItem = async (
  menuItemId: number,
  menuItemData: MenuItemArgs,
) => {
  const data: any = {
    name: menuItemData.name,
    description: menuItemData.description,
    price: menuItemData.price,
    isAvailable: menuItemData.isAvailable,
    category: {
      connectOrCreate: {
        where: { name: menuItemData.category },
        create: {
          name: menuItemData.category,
        },
      },
    },
  };

  if (menuItemData.image) {
    data.image = menuItemData.image;
  }

  return prisma.menuItem.update({
    where: { id: menuItemId },
    data,
  });
};

export const deleteOneMenuItem = async (id: number) => {
  return prisma.menuItem.delete({
    where: { id },
  });
};

export const getOneMenuItem = async (id: number) => {
  return prisma.menuItem.findUnique({
    where: { id },
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
  });
};

export const getMenuItemList = async (options: any) => {
  return prisma.menuItem.findMany(options);
};
