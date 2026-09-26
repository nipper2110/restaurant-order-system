import customerApi from "@/api/customerClient";
import type {
  Category,
  MenuItem,
  MenuItemDetail,
  OrderDetail,
  TableStatusValue,
} from "@/types";

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

export const getMenuItem = async (id: number): Promise<MenuItemDetail> => {
  const { data } = await customerApi.get(`/users/menu-items/${id}`);
  return data.menuItem;
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

export interface ConfirmOrderItemPayload {
  menuItemId: number;
  quantity: number;
  note?: string;
  productOptionIds?: number[];
}

export const confirmOrder = async (
  orderId: number,
  tableId: number,
  items: ConfirmOrderItemPayload[],
) => {
  const { data } = await customerApi.post(`/users/orders/${orderId}/confirm`, {
    tableId,
    items,
  });
  return data as { batchNumber: number };
};
