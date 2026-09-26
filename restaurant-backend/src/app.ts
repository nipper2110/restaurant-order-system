import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { handle, LanguageDetector } from "i18next-http-middleware";
import path from "path";
import cron from "node-cron";

import { limiter } from "./middlewares/rateLimiter";
import routes from "./routes/v1";

export const app = express();

var whitelist = ["http://example1.com"];
var localhostPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
var corsOptions = {
  origin: function (
    origin: any,
    callback: (err: Error | null, origin?: any) => void,
  ) {
    // Allow requests with no origin (like mobile apps)
    if (!origin) return callback(null, true);

    // Local Vite dev servers pick whatever port is free, so allow any
    // localhost port in development instead of hardcoding one that drifts.
    const isLocalDev =
      process.env.NODE_ENV !== "production" && localhostPattern.test(origin);

    if (whitelist.includes(origin) || isLocalDev) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies or authorizarion header
};

app
  .use(morgan("dev"))
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use(cookieParser())
  .use(cors(corsOptions))
  .use(helmet())
  .use(compression())
  .use(limiter);

app.use(routes);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
});

app.use(express.static("uploads")); // to see the photo in localhost

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  const message = error.message || "Server Error";
  const errorCode = error.code || "Error_Code";
  res.status(status).json({ message, error: errorCode });
});
