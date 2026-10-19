import { authApi } from "@/api";

export const requestPasswordReset = async (
  email: string,
): Promise<{ email: string; rememberToken: string }> => {
  const { data } = await authApi.post("/forget-password", { email });
  return { email: data.email, rememberToken: data.rememberToken };
};

export const verifyResetOtp = async (
  email: string,
  otp: string,
  token: string,
): Promise<{ email: string; token: string }> => {
  const { data } = await authApi.post("/verify", { email, otp, token });
  return { email: data.email, token: data.token };
};

export const resetPassword = async (
  email: string,
  password: string,
  token: string,
): Promise<void> => {
  await authApi.post("/reset-password", { email, password, token });
};
