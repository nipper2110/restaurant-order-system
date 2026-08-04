import { Request, Response, NextFunction } from "express";

export const createCategory = [
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: "Created Category Successfully." });
  },
];
