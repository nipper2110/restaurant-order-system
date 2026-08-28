import { errorCode } from "../../config/errorCode";
import { prisma } from "./prismaClient";
import { createError } from "../utils/error";
import { Prisma } from "../generated/prisma/client";

export type createOrderItemArgs = {
  orderId: number;
  menuItemId: number;
  quantity: number;
  note?: string;
  productOptionId?: number;
  tableId: number;
};

export type updateOrderItemArgs = {
  id: number;
  quantity?: number;
  note?: string;
  productOptionId?: number;
  tableId: number;
};

export const createOneOrderItem = async (data: createOrderItemArgs) => {
  const existingOrder = await prisma.order.findUnique({
    where: { id: data.orderId },
  });
  if (!existingOrder) {
    throw createError("Order not found.", 404, errorCode.notFound);
  }

  if (existingOrder.tableId !== data.tableId) {
    throw createError(
      "Unauthorized to add item to this order.",
      403,
      errorCode.forbidden,
    );
  }

  const menuItem = await prisma.menuItem.findUnique({
    where: { id: data.menuItemId },
  });
  if (!menuItem) {
    throw createError("Menu item not found.", 404, errorCode.notFound);
  }

  let optionPrice = 0;
  if (data.productOptionId) {
    const productOption = await prisma.productOption.findUnique({
      where: { id: data.productOptionId },
    });

    if (!productOption) {
      throw createError("Product option not found.", 404, errorCode.notFound);
    }

    optionPrice = Number(productOption.additionalPrice || 0);
  }

  const basePrice = Number(menuItem.price) + optionPrice;
  const itemPrice = basePrice * data.quantity;

  const calculatedPrice = new Prisma.Decimal(itemPrice);

  return await prisma.orderItem.create({
    data: {
      orderId: data.orderId,
      menuItemId: data.menuItemId,
      quantity: data.quantity,
      price: calculatedPrice,
      note: data.note || null,
      productOptionId: data.productOptionId || null,
    },
  });
};

export const updateOneOrderItem = async (
  id: number,
  data: updateOrderItemArgs,
) => {
  const existingItem = await prisma.orderItem.findUnique({
    where: { id },
    include: { menuItem: true, order: true },
  });

  if (!existingItem) {
    throw createError("Order item not found.", 404, errorCode.notFound);
  }

  if (existingItem.order.tableId !== data.tableId) {
    throw createError(
      "Unauthorized to update this order item.",
      403,
      errorCode.forbidden,
    );
  }

  const quantity = data.quantity ?? existingItem.quantity;
  const productOptionId =
    data.productOptionId !== undefined
      ? data.productOptionId
      : existingItem.productOptionId;

  let optionPrice = 0;
  if (productOptionId) {
    const productOption = await prisma.productOption.findUnique({
      where: { id: productOptionId },
    });
    if (productOption) {
      optionPrice = Number(productOption.additionalPrice || 0);
    }
  }

  const basePrice = Number(existingItem.menuItem.price) + optionPrice;
  const calculatedPrice = basePrice * quantity;
  const newPrice = new Prisma.Decimal(calculatedPrice);

  return prisma.orderItem.update({
    where: { id },
    data: {
      quantity: quantity,
      price: newPrice,
      note: data.note !== undefined ? data.note : existingItem.note,
      productOptionId: productOptionId,
    },
  });
};

export const deleteOneOrderItem = async (id: number, tableId: number) => {
  const existingItem = await prisma.orderItem.findUnique({
    where: { id },
    include: {
      order: true,
    },
  });

  if (!existingItem) {
    throw createError("Order item not found.", 404, errorCode.notFound);
  }

  if (existingItem.order.tableId !== tableId) {
    throw createError(
      "Unauthorized to delete this order item.",
      403,
      errorCode.forbidden,
    );
  }

  return await prisma.orderItem.delete({
    where: { id },
  });
};

export const getOneOrderItem = async (id: number, tableId: number) => {
  const existingItem = await prisma.orderItem.findUnique({
    where: { id },
    include: {
      order: true,
    },
  });

  if (!existingItem) {
    throw createError("Order item not found.", 404, errorCode.notFound);
  }

  if (existingItem.order.tableId !== tableId) {
    throw createError(
      "Unauthorized to get this order item.",
      403,
      errorCode.forbidden,
    );
  }

  return prisma.orderItem.findUnique({
    where: { id },
    include: {
      menuItem: true,
      productOption: true,
    },
  });
};

export const getOrderItemList = async (orderId: number, tableId: number) => {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!existingOrder) {
    throw createError("Order not found.", 404, errorCode.notFound);
  }

  if (existingOrder.tableId !== tableId) {
    throw createError(
      "Unauthorized to view this order.",
      403,
      errorCode.forbidden,
    );
  }

  return prisma.orderItem.findMany({
    where: { orderId },
    include: {
      menuItem: true,
      productOption: true,
    },
    orderBy: {
      id: "desc",
    },
  });
};
