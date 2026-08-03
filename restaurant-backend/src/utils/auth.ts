import { errorCode } from "../../config/errorCode";

export const checkUserExist = (user: any) => {
  if (user) {
    const error: any = new Error("This email has already been registered.");
    error.status = 409;
    error.code = errorCode.userExist;
    throw error;
  }
};
