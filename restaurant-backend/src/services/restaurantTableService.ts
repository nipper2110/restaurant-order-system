import { errorCode } from "../../config/errorCode";
import { TableStatus } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { createError } from "../utils/error";

export type RestaurantTableArgs = {
  tableNumber: number;
  qrCode: string;
  status?: TableStatus;
};

export const createOneRestaurantTable = async (
  restaurantTableData: RestaurantTableArgs,
) => {
  const data: any = {
    tableNumber: restaurantTableData.tableNumber,
    qrCode: restaurantTableData.qrCode,
  };

  return prisma.restaurantTable.create({
    data,
  });
};

export const getRestaurantTableByNumber = async (tableNumber: number) => {
  return prisma.restaurantTable.findUnique({
    where: { tableNumber },
  });
};

export const getRestaurantTableByQrCode = async (qrCode: string) => {
  return prisma.restaurantTable.findUnique({
    where: { qrCode },
  });
};

export const getRestaurantTableById = async (id: number) => {
  return prisma.restaurantTable.findUnique({
    where: { id },
  });
};

export const updateOneRestaurantTable = async (
  id: number,
  restaurantTableData: RestaurantTableArgs,
) => {
  const { tableNumber, qrCode, status } = restaurantTableData;

  const existingTable = await prisma.restaurantTable.findFirst({
    where: {
      tableNumber,
      NOT: { id },
    },
  });
  if (existingTable) {
    throw createError("The table is already existed.", 409, errorCode.invalid);
  }

  const existingQrCode = await prisma.restaurantTable.findFirst({
    where: {
      qrCode,
      NOT: { id },
    },
  });
  if (existingQrCode) {
    throw createError("QR code is already existed.", 409, errorCode.invalid);
  }

  return await prisma.restaurantTable.update({
    where: { id },
    data: {
      tableNumber,
      qrCode,
      status,
    },
  });
};

export const deleteOneRestaurantTable = async (id: number) => {
  return prisma.restaurantTable.delete({
    where: { id },
  });
};

export const getOneRestaurantTable = async (id: number) => {
  return prisma.restaurantTable.findUnique({
    where: { id },
  });
};

export const getRestaurantTableList = async () => {
  return prisma.restaurantTable.findMany({
    orderBy: {
      id: "asc",
    },
  });
};
