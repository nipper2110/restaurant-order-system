import api from "@/api/index";
import type { RestaurantTable } from "@/types";

export const getTables = async (): Promise<RestaurantTable[]> => {
  const { data } = await api.get("/admins/restaurant-tables");
  return data.restaurantTable;
};

export const createTable = async (
  tableNumber: number,
): Promise<{ restaurantTableId: number; qrCode: string }> => {
  const { data } = await api.post("/admins/restaurant-tables", {
    tableNumber,
  });
  return { restaurantTableId: data.restaurantTableId, qrCode: data.qrCode };
};

export interface UpdateTablePayload {
  tableId: number;
  tableNumber?: number;
  status?: "AVAILABLE" | "OCCUPIED";
}

export const updateTable = async (
  payload: UpdateTablePayload,
): Promise<void> => {
  await api.patch("/admins/restaurant-tables", payload);
};

export const deleteTable = async (tableId: number): Promise<void> => {
  await api.delete("/admins/restaurant-tables", { data: { tableId } });
};

export const regenerateTableQrCode = async (
  tableId: number,
): Promise<{ qrCode: string }> => {
  const { data } = await api.post(
    `/admins/restaurant-tables/${tableId}/regenerate-qr`,
  );
  return { qrCode: data.qrCode };
};
