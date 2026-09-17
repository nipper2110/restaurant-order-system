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

export const getTodayOrderStats = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const result = await prisma.order.aggregate({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    _count: { id: true },
    _sum: { totalPrice: true },
  });

  return {
    totalOrders: result._count.id,
    totalRevenue: Number(result._sum.totalPrice) || 0,
  };
};
