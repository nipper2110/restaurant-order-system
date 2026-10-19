import api from "@/api/index";

export interface CurrentAdmin {
  id: number;
  name: string | null;
  email: string;
  role: string;
}

export const getMe = async (): Promise<CurrentAdmin> => {
  const { data } = await api.get("/admins/me");
  return data.admin;
};

export const updateProfile = async (name: string): Promise<CurrentAdmin> => {
  const { data } = await api.patch("/admins/me", { name });
  return data.admin;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  await api.patch("/admins/me/password", { currentPassword, newPassword });
};
