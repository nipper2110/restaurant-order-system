import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import moment from "moment";
import jwt from "jsonwebtoken";

import { createError } from "../utils/error";
import { errorCode } from "../../config/errorCode";
import {
  createOtp,
  createUser,
  getAnyAdmin,
  getOtpByEmail,
  getUserByEmail,
  updateOtp,
  updateUser,
} from "../services/authService";
import {
  checkAdminAlreadyExist,
  checkOtpErrorIfSameDate,
  checkOtpRow,
  checkUserExist,
} from "../utils/auth";
import { generateToken } from "../utils/generate";

export const register = [
  body("email", "Invalid email").trim().notEmpty().isEmail().normalizeEmail(),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const existingAdmin = await getAnyAdmin();
    checkAdminAlreadyExist(existingAdmin);

    let email = req.body.email;

    const user = await getUserByEmail(email);
    checkUserExist(user);

    const otp = 123456; // for testing
    const salt = await bcrypt.genSalt(10);
    const hashOtp = await bcrypt.hash(otp.toString(), salt);

    const token = generateToken();

    const otpRow = await getOtpByEmail(email);

    let result;

    if (!otpRow) {
      const otpData = {
        email,
        otp: hashOtp,
        rememberToken: token,
      };
      result = await createOtp(otpData);
    } else {
      const lastOtpRequest = new Date(otpRow.updatedAt).toLocaleDateString();
      const today = new Date().toLocaleDateString();
      const isSameDate = lastOtpRequest === today;

      checkOtpErrorIfSameDate(isSameDate, otpRow.error);

      if (!isSameDate) {
        const otpData = {
          otp: hashOtp,
          rememberToken: token,
          count: 1,
        };
        result = await updateOtp(otpRow.id, otpData);
      } else {
        if (otpRow.count === 3) {
          return next(
            createError(
              "OTP is allowed to request 3 times per day.",
              429,
              errorCode.overLimit,
            ),
          );
        } else {
          const otpData = {
            otp: hashOtp,
            rememberToken: token,
            count: {
              increment: 1,
            },
          };
          result = await updateOtp(otpRow.id, otpData);
        }
      }
    }

    res.status(200).json({
      message: `We are sending OTP to ${result.email}`,
      email: result.email,
      rememberToken: result.rememberToken,
    });
  },
];

export const verifyOtp = [
  body("email", "Invalid email").trim().notEmpty().isEmail().normalizeEmail(),
  body("otp", "Invalid OTP")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 6, max: 6 }),
  body("token", "Invalid Token").trim().notEmpty().escape(),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    let { email, otp, token } = req.body;

    const user = await getUserByEmail(email);
    checkUserExist(user);

    const otpRow = await getOtpByEmail(email);
    checkOtpRow(otpRow);

    const lastOtpVerify = new Date(otpRow!.updatedAt).toLocaleDateString();
    const today = new Date().toLocaleDateString();
    const isSameDate = lastOtpVerify === today;

    checkOtpErrorIfSameDate(isSameDate, otpRow!.error);

    // Token is wrong
    if (otpRow?.rememberToken !== token) {
      const otpData = {
        error: 5,
      };
      await updateOtp(otpRow!.id, otpData);
      return next(createError("Invalid Token", 401, errorCode.invalid));
    }

    // OTP is expired
    const isExpired = moment().diff(otpRow?.updatedAt, "minutes") > 2;
    if (isExpired) {
      return next(createError("OTP is expired", 403, errorCode.otpExpired));
    }

    const isMatchOTP = await bcrypt.compare(otp, otpRow!.otp);
    // OTP is wrong
    if (!isMatchOTP) {
      // If OTP error is first time today
      if (!isSameDate) {
        const otpData = {
          error: 1,
        };
        await updateOtp(otpRow!.id, otpData);
      } else {
        //If OTP error is not first time today
        const otpData = {
          error: {
            increment: 1,
          },
        };
        await updateOtp(otpRow!.id, otpData);
      }
      return next(createError("OTP is incorrect", 401, errorCode.invalid));
    }

    // All are OK
    const verifyToken = generateToken();
    const otpData = {
      verifyToken,
      error: 0,
      count: 1,
    };

    const result = await updateOtp(otpRow!.id, otpData);

    res.status(200).json({
      message: "OTP is successfully verified.",
      email: result.email,
      token: verifyToken,
    });
  },
];

export const confirmPassword = [
  body("email", "Invalid email").trim().notEmpty().isEmail().normalizeEmail(),
  body("password", "Passwrod must be 6 digits")
    .notEmpty()
    .trim()
    .matches("^[0-9]+$")
    .isLength({ min: 6, max: 6 }),
  body("token", "Invalid Token").notEmpty().trim().escape(),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    let { email, password, token } = req.body;

    const user = await getUserByEmail(email);
    checkUserExist(user);

    const otpRow = await getOtpByEmail(email);
    checkOtpRow(otpRow);

    // OTP error count is over limit
    if (otpRow!.error === 5) {
      return next(
        createError("This request may be an attack.", 400, errorCode.attack),
      );
    }

    // Token is wrong
    if (otpRow!.verifyToken !== token) {
      const otpData = {
        error: 5,
      };
      await updateOtp(otpRow!.id, otpData);
      return next(createError("Invalid Token", 401, errorCode.invalid));
    }

    // Request is expired
    const isExpired = moment().diff(otpRow!.updatedAt, "minutes") > 10;
    if (isExpired) {
      return next(
        createError(
          "Your request is expired. Please try again.",
          403,
          errorCode.requestExpired,
        ),
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const randToken = "I will replace Refresh Token soon";

    // Create new account
    const userData = {
      email,
      password: hashPassword,
      randToken,
    };
    const newUser = await createUser(userData);

    const accessTokenPayload = { id: newUser.id };
    const refreshTokenPayload = { id: newUser.id, email: newUser.email };

    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: 60 * 15,
      },
    );

    const refreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "30d",
      },
    );

    // Updating randToken with refreshToken
    const userUpdateData = {
      randToken: refreshToken,
    };
    await updateUser(newUser.id, userUpdateData);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000, // 15 min
        path: "/",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/",
      })
      .status(201)
      .json({
        message: "Successfully created an account",
        userId: newUser.id,
      });
  },
];
