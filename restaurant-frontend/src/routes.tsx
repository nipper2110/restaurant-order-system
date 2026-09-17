import { createBrowserRouter } from "react-router";

import RootLayout from "@/pages/RootLayout";
import DashboardPage from "@/pages/Dashboard";
import OrdersPage from "@/pages/Orders";
import MenuItemsPage from "@/pages/MenuItems";
import MenuItemFormPage from "@/pages/MenuItemForm";
import LoginPage from "@/pages/Login";
import ErrorPage from "@/pages/Error";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
    ErrorBoundary: ErrorPage,
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
