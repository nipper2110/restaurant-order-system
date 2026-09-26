import customerApi from "@/api/customerClient";
import type { Category, MenuItem, OrderDetail, TableStatusValue } from "@/types";

export interface TableSession {
  tableId: number;
  tableNumber: number;
  status: TableStatusValue;
  orderId: number;
}

export const verifyTable = async (qrToken: string): Promise<TableSession> => {
  const { data } = await customerApi.get(
    `/users/tables/qr-codes/verify/${qrToken}`,
  );
  return data.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await customerApi.get("/users/categories");
  return data.category;
};

export const getMenuItems = async (limit = 100): Promise<MenuItem[]> => {
  const { data } = await customerApi.get("/users/menu-items", {
    params: { limit },
  });
  return data.menuItems;
};

export const getOrder = async (
  orderId: number,
  tableId: number,
): Promise<OrderDetail> => {
  const { data } = await customerApi.get(`/users/orders/${orderId}`, {
    params: { tableId },
  });
  return data.order;
};

export interface AddOrderItemPayload {
  tableId: number;
  menuItemId: number;
  quantity: number;
  note?: string;
}

export const addOrderItem = async (
  orderId: number,
  payload: AddOrderItemPayload,
) => {
  const { data } = await customerApi.post(
    `/users/orders/items/${orderId}`,
    payload,
  );
  return data.orderItem;
};
