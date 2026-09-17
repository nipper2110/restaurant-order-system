import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getRecentOrders } from "@/api/dashboard";
import type { Order } from "@/types";

function formatCurrency(value: string) {
  return `฿${Number(value).toLocaleString()}`;
}

function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getRecentOrders()
      .then((data) => {
        if (isMounted) setOrders(data);
      })
      .catch(() => {
        if (isMounted) setError("Failed to load recent orders.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
        <Link
          to="/orders"
          className="text-sm font-medium text-[#fbbf24] hover:text-[#fbbf24]/80 transition-colors"
        >
          View all
        </Link>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-x-auto">
        {isLoading ? (
          <p className="py-6 text-sm text-white/40">Loading orders...</p>
        ) : error ? (
          <p className="py-6 text-sm text-red-400">{error}</p>
        ) : orders.length === 0 ? (
          <p className="py-6 text-sm text-white/40">No orders yet.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-3 text-xs font-medium tracking-wide text-white/40">
                  ORDER ID
                </th>
                <th className="pb-3 text-xs font-medium tracking-wide text-white/40">
                  TABLE
                </th>
                <th className="pb-3 text-xs font-medium tracking-wide text-white/40">
                  ITEMS
                </th>
                <th className="pb-3 text-xs font-medium tracking-wide text-white/40">
                  TOTAL
                </th>
                <th className="pb-3 text-xs font-medium tracking-wide text-white/40">
                  DATE
                </th>
                <th className="pb-3 text-xs font-medium tracking-wide text-white/40 text-right">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 text-sm font-medium text-white">
                    #ORD-{String(order.id).padStart(4, "0")}
                  </td>
                  <td className="py-4 text-sm text-white/60">
                    Table {String(order.table.tableNumber).padStart(2, "0")}
                  </td>
                  <td className="py-4 text-sm text-white/60">
                    {order.orderItems.length} items
                  </td>
                  <td className="py-4 text-sm font-semibold text-white tabular-nums">
                    {formatCurrency(order.totalPrice)}
                  </td>
                  <td className="py-4 text-sm text-white/40">
                    {order.createdAt}
                  </td>
                  <td className="py-4 text-right">
                    <Link
                      to="/orders"
                      className="text-sm font-medium text-[#fbbf24] hover:text-[#fbbf24]/80 transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default RecentOrders;
