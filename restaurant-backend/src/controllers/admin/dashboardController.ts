import { Request, Response, NextFunction } from "express";
import { getUserById } from "../../services/authService";
import { checkUserIfNotExist } from "../../utils/auth";
import { getTodayOrderStats } from "../../services/orderService";
import { getMenuItemCount } from "../../services/menuItemService";
import { getCategoryCount } from "../../services/categoryService";
import { getTableCounts } from "../../services/restaurantTableService";

interface CustomRequest extends Request {
  userId?: number;
}

export const getDashboardStats = [
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const user = await getUserById(userId!);
    checkUserIfNotExist(user);

    const [orderStats, menuItemCount, categoryCount, tableCounts] =
      await Promise.all([
        getTodayOrderStats(),
        getMenuItemCount(),
        getCategoryCount(),
        getTableCounts(),
      ]);

    res.status(200).json({
      message: "Dashboard Stats",
      stats: {
        totalOrdersToday: orderStats.totalOrders,
        totalRevenueToday: orderStats.totalRevenue,
        totalMenuItems: menuItemCount,
        totalCategories: categoryCount,
        occupiedTables: tableCounts.occupied,
        totalTables: tableCounts.total,
      },
    });
  },
];
