import { errorCode } from "../../config/errorCode";
import { prisma } from "./prismaClient";
import { createError } from "../utils/error";
import { Prisma } from "../generated/prisma/client";
import { recalculateOrderTotal } from "./orderService";

export type createOrderItemArgs = {
  orderId: number;
  menuItemId: number;
  quantity: number;
  note?: string;
  productOptionIds?: number[];
  tableId: number;
};

export type updateOrderItemArgs = {
  id: number;
  quantity?: number;
  note?: string;
  productOptionIds?: number[];
  tableId: number;
};

// Validates the selected options belong to the given menu item, that each
// option's category gets at most one selection (categories behave as
// single-select groups), and that every required category has one, then
// returns the combined additional price for all selections.
const resolveSelectedOptions = async (
  menuItemId: number,
  productOptionIds: number[] | undefined,
) => {
  const categories = await prisma.productOptionCategory.findMany({
    where: { menuItemId },
    include: { options: true },
  });

  const selectedIds = new Set(productOptionIds || []);
  const validOptionIds = new Set(
    categories.flatMap((category) => category.options.map((o) => o.id)),
  );

  for (const id of selectedIds) {
    if (!validOptionIds.has(id)) {
      throw createError(
        "Invalid product option for this menu item.",
        400,
        errorCode.invalid,
      );
    }
  }

  let optionPrice = 0;
  for (const category of categories) {
    const selectedInCategory = category.options.filter((o) =>
      selectedIds.has(o.id),
    );

    if (selectedInCategory.length > 1) {
      throw createError(
        `Only one option can be selected for "${category.name}".`,
        400,
        errorCode.invalid,
      );
    }

    if (category.isRequired && selectedInCategory.length === 0) {
      throw createError(
        `"${category.name}" is required.`,
        400,
        errorCode.invalid,
      );
    }

    if (selectedInCategory.length === 1) {
      optionPrice += Number(selectedInCategory[0].additionalPrice || 0);
    }
  }

  return { optionPrice, optionIds: Array.from(selectedIds) };
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

  const { optionPrice, optionIds } = await resolveSelectedOptions(
    data.menuItemId,
    data.productOptionIds,
  );

  const basePrice = Number(menuItem.price) + optionPrice;
  const itemPrice = basePrice * data.quantity;

  const calculatedPrice = new Prisma.Decimal(itemPrice);

  const orderItem = await prisma.orderItem.create({
    data: {
      orderId: data.orderId,
      menuItemId: data.menuItemId,
      quantity: data.quantity,
      price: calculatedPrice,
      note: data.note || null,
      productOptions: { connect: optionIds.map((id) => ({ id })) },
    },
  });

  await recalculateOrderTotal(data.orderId);

  return orderItem;
};

export type ConfirmOrderItemInput = {
  menuItemId: number;
  quantity: number;
  note?: string;
  productOptionIds?: number[];
};

// Creates every cart item from one "Confirm Order" tap under a single new
// batch number, so the customer's order history can show it as one round.
export const confirmOrderItems = async (
  orderId: number,
  tableId: number,
  items: ConfirmOrderItemInput[],
) => {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });
  if (!existingOrder) {
    throw createError("Order not found.", 404, errorCode.notFound);
  }
  if (existingOrder.tableId !== tableId) {
    throw createError(
      "Unauthorized to add items to this order.",
      403,
      errorCode.forbidden,
    );
  }
  if (!items || items.length === 0) {
    throw createError("At least one item is required.", 400, errorCode.invalid);
  }

  const lastBatch = await prisma.orderItem.aggregate({
    where: { orderId },
    _max: { batchNumber: true },
  });
  const batchNumber = (lastBatch._max.batchNumber || 0) + 1;

  const createdItems = [];
  for (const item of items) {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: item.menuItemId },
    });
    if (!menuItem) {
      throw createError("Menu item not found.", 404, errorCode.notFound);
    }

    const { optionPrice, optionIds } = await resolveSelectedOptions(
      item.menuItemId,
      item.productOptionIds,
    );

    const basePrice = Number(menuItem.price) + optionPrice;
    const calculatedPrice = new Prisma.Decimal(basePrice * item.quantity);

    const orderItem = await prisma.orderItem.create({
      data: {
        orderId,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: calculatedPrice,
        note: item.note || null,
        batchNumber,
        productOptions: { connect: optionIds.map((id) => ({ id })) },
      },
    });
    createdItems.push(orderItem);
  }

  await recalculateOrderTotal(orderId);

  return { batchNumber, items: createdItems };
};

export const updateOneOrderItem = async (
  id: number,
  data: updateOrderItemArgs,
) => {
  const existingItem = await prisma.orderItem.findUnique({
    where: { id },
    include: { menuItem: true, order: true, productOptions: true },
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
  const productOptionIds =
    data.productOptionIds !== undefined
      ? data.productOptionIds
      : existingItem.productOptions.map((o) => o.id);

  const { optionPrice, optionIds } = await resolveSelectedOptions(
    existingItem.menuItemId,
    productOptionIds,
  );

  const basePrice = Number(existingItem.menuItem.price) + optionPrice;
  const calculatedPrice = basePrice * quantity;
  const newPrice = new Prisma.Decimal(calculatedPrice);

  const updated = await prisma.orderItem.update({
    where: { id },
    data: {
      quantity: quantity,
      price: newPrice,
      note: data.note !== undefined ? data.note : existingItem.note,
      productOptions: { set: optionIds.map((optionId) => ({ id: optionId })) },
    },
  });

  await recalculateOrderTotal(existingItem.orderId);

  return updated;
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

  const deleted = await prisma.orderItem.delete({
    where: { id },
  });

  await recalculateOrderTotal(existingItem.orderId);

  return deleted;
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
      productOptions: {
        include: { productOptionCategory: true },
      },
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
      productOptions: {
        include: { productOptionCategory: true },
      },
    },
    orderBy: {
      id: "desc",
    },
  });
};
