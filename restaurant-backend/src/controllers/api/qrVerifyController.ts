import { Request, Response, NextFunction } from "express";
import { createError } from "../../utils/error";
import { errorCode } from "../../../config/errorCode";
import { verifyRestaurantTableByQrCode } from "../../services/qrVerifyService";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

export const verifyRestaurantTable = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.params;

    if (!token || typeof token !== "string") {
      return next(
        createError("QR code token is required.", 400, errorCode.invalid),
      );
    }

    const restaurantTable = await verifyRestaurantTableByQrCode(
      token as string,
    );

    res.status(200).json({
      message: "QR code is valid.",
      data: {
        tableId: restaurantTable.id,
        tableNumber: restaurantTable.tableNumber,
        status: restaurantTable.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
