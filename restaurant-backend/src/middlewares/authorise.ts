import { Request, Response, NextFunction } from "express";
import { getUserById } from "../services/authService";
import { checkUserIfNotExist } from "../utils/auth";
import { errorCode } from "../../config/errorCode";
import { createError } from "../utils/error";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

// authorise(true, "ADMIN") // deny - "USER"
// authoris(false, "CUSTOMER") // allow - "ADMIN", "AUTHOR"
export const authorise = (permission: boolean, ...roles: string[]) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const user = await getUserById(userId!);

    if (!user) {
      return next(
        createError(
          "This user has not been registered.",
          401,
          errorCode.unauthenticated,
        ),
      );
    }

    const result = roles.includes(user.role);

    if (permission && !result) {
      return next(
        createError("This action is not allowed.", 403, errorCode.unauthorised),
      );
    }

    if (!permission && result) {
      return next(
        createError("This action is not allowed.", 403, errorCode.unauthorised),
      );
    }

    req.user = user;

    next();
  };
};
