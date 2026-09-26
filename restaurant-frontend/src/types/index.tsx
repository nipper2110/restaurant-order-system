export interface Category {
  id: number;
  name: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  isAvailable: boolean;
  image: string;
  createdAt?: string;
  updatedAt?: string;
  category: {
    name: string;
  };
}

export interface DashboardStats {
  totalOrdersToday: number;
  totalRevenueToday: number;
  totalMenuItems: number;
  totalCategories: number;
  occupiedTables: number;
  totalTables: number;
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  note: string | null;
  menuItemId: number;
  orderId: number;
  productOptionId: number | null;
}

export type TableStatusValue = "AVAILABLE" | "OCCUPIED";

export interface RestaurantTable {
  id: number;
  tableNumber: number;
  qrCode: string;
  status: TableStatusValue;
}

export interface Order {
  id: number;
  totalPrice: string;
  createdAt: string;
  tableId: number;
  table: {
    id: number;
    tableNumber: number;
    status: TableStatusValue;
  };
  orderItems: OrderItem[];
}

export interface OrderItemDetail {
  id: number;
  quantity: number;
  price: string;
  note: string | null;
  menuItem: {
    id: number;
    name: string;
  };
  productOption: {
    id: number;
    name: string;
    productOptionCategory: {
      name: string;
    };
  } | null;
}

export interface OrderDetail {
  id: number;
  totalPrice: string;
  createdAt: string;
  tableId: number;
  table: {
    id: number;
    tableNumber: number;
    status: TableStatusValue;
  };
  orderItems: OrderItemDetail[];
}
