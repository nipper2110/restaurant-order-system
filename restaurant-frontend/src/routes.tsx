import { createBrowserRouter } from "react-router";

import RootLayout from "@/pages/RootLayout";
import DashboardPage from "@/pages/Dashboard";
import OrdersPage from "@/pages/Orders";
import MenuItemsPage from "@/pages/MenuItems";
import MenuItemFormPage from "@/pages/MenuItemForm";
import LoginPage from "@/pages/Login";
import ErrorPage from "@/pages/Error";
import CustomerLayout from "@/pages/customer/CustomerLayout";
import TableMenuPage from "@/pages/customer/TableMenu";
import ItemDetailPage from "@/pages/customer/ItemDetail";
import CartPage from "@/pages/customer/Cart";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
    ErrorBoundary: ErrorPage,
  },
  {
    path: "/order/:qrToken",
    Component: CustomerLayout,
    ErrorBoundary: ErrorPage,
    children: [
      {
        index: true,
        Component: TableMenuPage,
      },
      {
        path: "items/:itemId",
        Component: ItemDetailPage,
      },
      {
        path: "cart",
        Component: CartPage,
      },
    ],
  },
  {
    path: "/",
    Component: RootLayout,
    ErrorBoundary: ErrorPage,
    children: [
      {
        index: true,
        Component: DashboardPage,
      },
      {
        path: "orders",
        Component: OrdersPage,
      },
      {
        path: "menuItems",
        Component: MenuItemsPage,
      },
      {
        path: "menuItems/new",
        Component: MenuItemFormPage,
      },
      {
        path: "menuItems/:id/edit",
        Component: MenuItemFormPage,
      },
    ],
  },
]);
