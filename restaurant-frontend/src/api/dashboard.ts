import api from "@/api/index";
import type { DashboardStats, Order, RestaurantTable } from "@/types";

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get("/admins/dashboard/stats");
  return data.stats;
};

export const getRecentOrders = async (limit = 6): Promise<Order[]> => {
  const { data } = await api.get("/admins/orders", { params: { limit } });
  return data.orders;
};

export const getRestaurantTables = async (): Promise<RestaurantTable[]> => {
  const { data } = await api.get("/admins/restaurant-tables");
  return data.restaurantTable;
};
