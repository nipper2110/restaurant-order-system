import { prisma } from "../lib/prisma";

export const getUserByEmail = async (email: string) => {
  return prisma.admin.findUnique({
    where: { email },
  });
};

export const getOtpByEmail = async (email: string) => {
  return prisma.otp.findUnique({
    where: { email },
  });
};

export const createOtp = async (otpData: any) => {
  return prisma.otp.create({
    data: otpData,
  });
};

export const updateOtp = async (id: number, otpData: any) => {
  return prisma.otp.update({
    where: { id },
    data: otpData,
  });
};

export const createUser = async (userData: any) => {
  return prisma.admin.create({
    data: userData,
  });
};

export const updateUser = async (id: number, userData: any) => {
  return prisma.admin.update({
    where: { id },
    data: userData,
  });
};

export const getUserById = async (id: number) => {
  return prisma.admin.findUnique({
    where: { id },
  });
};

export const getAnyAdmin = async () => {
  return prisma.admin.findFirst();
};
