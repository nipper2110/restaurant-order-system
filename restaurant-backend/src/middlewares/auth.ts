import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { createError } from "../utils/error";
import { errorCode } from "../../config/errorCode";
import { getUserById, updateUser } from "../services/authService";

interface CustomRequest extends Request {
  userId?: number;
}

export const auth = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const accessToken: any = req.cookies ? req.cookies.accessToken : null;
  const refreshToken: any = req.cookies ? req.cookies.refreshToken : null;

  if (!refreshToken) {
    return next(
      createError(
        "You are not an authenticated user.",
        401,
        errorCode.unauthenticated,
      ),
    );
  }

  const generateNewTokens = async () => {
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as {
        id: number;
        email: string;
      };
    } catch (error) {
      return next(
        createError(
          "You are not an authenticated user.",
          401,
          errorCode.unauthenticated,
        ),
      );
    }

    if (isNaN(decoded.id)) {
      return next(
        createError(
          "You are not an authenticated user.",
          401,
          errorCode.unauthenticated,
        ),
      );
    }

    const user = await getUserById(decoded.id);
    if (!user) {
      return next(
        createError(
          "You are not an authenticated user.",
          401,
          errorCode.unauthenticated,
        ),
      );
    }

    if (user.email !== decoded.email) {
      return next(
        createError(
          "You are not an authenticated user.",
          401,
          errorCode.unauthenticated,
        ),
      );
    }

    if (user.randToken !== refreshToken) {
      return next(
        createError(
          "You are not an authenticated user.",
          401,
          errorCode.unauthenticated,
        ),
      );
    }

    // Authorization token
    const accessTokenPayload = { id: user.id };
    const refreshTokenPayload = { id: user.id, email: user.email };

    const newAccessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: 60 * 15,
      },
    );

    const newRefreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "30d",
      },
    );

    const userData = {
      randToken: newRefreshToken,
    };
    await updateUser(user.id, userData);

    res
      .cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000, // 15 min
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

    req.userId = user.id;
    next();
  };

  if (!accessToken) {
    return generateNewTokens();
  } else {
    // Verify access Token
    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as {
        id: number;
      };

      if (isNaN(decoded.id)) {
        return next(
          createError(
            "You are not an authenticated user.",
            401,
            errorCode.unauthenticated,
          ),
        );
      }

      req.userId = decoded.id;
      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return generateNewTokens();
        // error.message = "Access Token has expired.";
        // error.status = 401;
        // error.code = errorCode.accessTokenExpired;
      } else {
        error.message = "Access Token is invalid.";
        error.status = 400;
        error.code = errorCode.attack;
        return next(
          createError("Access Token is invalid.", 400, errorCode.attack),
        );
      }
    }
  }
};
