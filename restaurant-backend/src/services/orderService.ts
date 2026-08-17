import { errorCode } from "../../config/errorCode";
import { prisma } from "./prismaClient";
import { createError } from "../utils/error";

export type orderArgs = {
  tableId: number;
  totalPrice?: number;
};

export const createOneOrder = async (orderData: orderArgs) => {
  const existingTable = await prisma.restaurantTable.findUnique({
    where: { id: orderData.tableId },
  });

  if (!existingTable) {
    throw createError("The table is not created yet.", 400, errorCode.invalid);
  }

  return prisma.order.create({
    data: { tableId: orderData.tableId, totalPrice: orderData.totalPrice || 0 },
  });
};

export const getOrderByTableId = async (id: number) => {
  return prisma.order.findFirst({
    where: { tableId: id },
  });
};

export const getOneOrder = async (id: number) => {
  return prisma.order.findUnique({
    where: { id },
  });
};

export const getOrderList = async (options: any) => {
  return prisma.order.findMany(options);
};
