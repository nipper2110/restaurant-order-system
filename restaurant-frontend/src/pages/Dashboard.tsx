import { useEffect, useState } from "react";
import RecentOrders from "@/components/dashboard/RecentOrders";
import StatCard from "@/components/dashboard/StatCard";
import TableStatus from "@/components/dashboard/TableStatus";
import { getDashboardStats } from "@/api/dashboard";
import type { DashboardStats } from "@/types";

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getDashboardStats()
      .then((data) => {
        if (isMounted) setStats(data);
      })
      .catch(() => {
        if (isMounted) setError("Failed to load dashboard stats.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="pb-6">
        <h1 className="font-bold text-xl text-[#fbbf24]">Dashboard</h1>
        <span className="text-sm text-gray-400">
          Welcome back. Here's what's happening at GUSTO.
        </span>
      </div>

      {error && <p className="pb-4 text-sm text-red-400">{error}</p>}

      <div className="pb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
        <StatCard
          label="Total Orders"
          value={stats ? stats.totalOrdersToday : "-"}
          caption="Today"
          icon="orders"
          accent="#fbbf24"
        />
        <StatCard
          label="Total Revenue"
          value={stats ? `฿${stats.totalRevenueToday.toLocaleString()}` : "-"}
          caption="Today"
          icon="revenue"
          accent="#22c55e"
        />
        <StatCard
          label="Menu Items"
          value={stats ? stats.totalMenuItems : "-"}
          caption={
            stats ? `Across ${stats.totalCategories} categories` : "Loading..."
          }
          icon="menuItems"
          accent="#3b82f6"
        />
        <StatCard
          label="Occupied Tables"
          value={stats ? `${stats.occupiedTables} / ${stats.totalTables}` : "-"}
          caption="Currently active"
          icon="tables"
          accent="#a855f7"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <div className="lg:col-span-1">
          <TableStatus />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
