import { errorCode } from "../../config/errorCode";
import { prisma } from "../lib/prisma";
import { createError } from "../utils/error";

export type createOrderItemArgs = {
  orderId: number;
  menuItemId: number;
  quantity: number;
  note?: string;
  productOptionId?: number;
};

export const createOneOrderItem = async (data: createOrderItemArgs) => {
  const existingOrder = await prisma.order.findUnique({
    where: { id: data.orderId },
  });
  if (!existingOrder) {
    throw createError("Order not found.", 404, errorCode.notFound);
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

  const calculatedPrice = Number(itemPrice);

  return await prisma.orderItem.create({
    data: {
      orderId: data.orderId,
      menuItemId: data.menuItemId,
      quantity: data.quantity,
      price: itemPrice,
      note: data.note || null,
      productOptionId: data.productOptionId || null,
    },
  });
};
