import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";

import { createError } from "../utils/error";
import { errorCode } from "../../config/errorCode";
import { getUserByEmail } from "../services/authService";
import { checkUserExist } from "../utils/auth";
import { generateToken } from "../utils/generate";

export const register = [
  body("name", "Invalid name").trim().notEmpty().isLength({ min: 2, max: 100 }),
  body("email", "Invalid email").trim().notEmpty().isEmail().normalizeEmail(),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    let { name, email } = req.body;

    const user = await getUserByEmail(email);
    checkUserExist(user);

    const otp = 123456; // for testing
    const salt = await bcrypt.genSalt(10);
    const hashOtp = await bcrypt.hash(otp.toString(), salt);

    const token = generateToken();

    res.status(200).json({ message: "Register success" });
  },
];
