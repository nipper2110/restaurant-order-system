import { createBrowserRouter } from "react-router";

import RootLayout from "@/pages/RootLayout";
import DashboardPage from "@/pages/Dashboard";
import OrdersPage from "@/pages/Orders";
import MenuItemsPage from "@/pages/MenuItems";
import ErrorPage from "@/pages/Error";

export const router = createBrowserRouter([
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
    ],
  },
]);
