import { errorCode } from "../../config/errorCode";
import { prisma } from "../lib/prisma";
import { createError } from "../utils/error";

export const verifyRestaurantTableByQrCode = async (qrCode: string) => {
  const restaurantTable = await prisma.restaurantTable.findUnique({
    where: { qrCode },
  });

  if (!restaurantTable) {
    throw createError("Invalid or expired QR code.", 404, errorCode.invalid);
  }

  return restaurantTable;
};
