import api from "@/api/index";
import type { Order, OrderDetail } from "@/types";

export const getOrders = async (limit = 100): Promise<Order[]> => {
  const { data } = await api.get("/admins/orders", { params: { limit } });
  return data.orders;
};

export const getOrder = async (id: number): Promise<OrderDetail> => {
  const { data } = await api.get(`/admins/orders/${id}`);
  return data.order;
};

export const completeOrder = async (id: number): Promise<void> => {
  await api.post(`/admins/orders/${id}/complete`);
};

export const setOrderItemServed = async (
  orderItemId: number,
  isServed: boolean,
): Promise<void> => {
  await api.patch(`/admins/order-items/${orderItemId}/served`, { isServed });
};
