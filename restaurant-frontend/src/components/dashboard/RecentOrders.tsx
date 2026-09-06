interface Order {
  id: string;
  table: string;
  items: number;
  total: string;
  time: string;
}

const orders: Order[] = [
  {
    id: "#ORD-0041",
    table: "Table 08",
    items: 4,
    total: "฿620",
    time: "14:32",
  },
  {
    id: "#ORD-0040",
    table: "Table 03",
    items: 2,
    total: "฿290",
    time: "14:18",
  },
  {
    id: "#ORD-0039",
    table: "Table 11",
    items: 6,
    total: "฿1,140",
    time: "14:05",
  },
  {
    id: "#ORD-0038",
    table: "Table 02",
    items: 3,
    total: "฿480",
    time: "13:51",
  },
  {
    id: "#ORD-0037",
    table: "Table 07",
    items: 5,
    total: "฿870",
    time: "13:39",
  },
  {
    id: "#ORD-0036",
    table: "Table 05",
    items: 1,
    total: "฿150",
    time: "13:22",
  },
  {
    id: "#ORD-0035",
    table: "Table 09",
    items: 7,
    total: "฿1,350",
    time: "13:10",
  },
];

function RecentOrders() {
  return (
    <div className="rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
        <button className="text-sm font-medium text-[#fbbf24] hover:text-[#fbbf24]/80 transition-colors">
          View all
        </button>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-x-auto">
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
                TIME
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
                  {order.id}
                </td>
                <td className="py-4 text-sm text-white/60">{order.table}</td>
                <td className="py-4 text-sm text-white/60">
                  {order.items} items
                </td>
                <td className="py-4 text-sm font-semibold text-white tabular-nums">
                  {order.total}
                </td>
                <td className="py-4 text-sm text-white/40">{order.time}</td>
                <td className="py-4 text-right">
                  <button className="text-sm font-medium text-[#fbbf24] hover:text-[#fbbf24]/80 transition-colors">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentOrders;
