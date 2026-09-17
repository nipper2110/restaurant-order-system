import { useEffect, useState } from "react";
import { Icons } from "@/components/icons";
import { getRestaurantTables } from "@/api/dashboard";
import type { RestaurantTable } from "@/types";

function TableStatus() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getRestaurantTables()
      .then((data) => {
        if (isMounted) setTables(data);
      })
      .catch(() => {
        if (isMounted) setError("Failed to load table status.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const occupiedCount = tables.filter((t) => t.status === "OCCUPIED").length;

  return (
    <div className="rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Table Status</h2>
        <div className="flex items-center gap-4 text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#fbbf24]" />
            Occupied
          </span>
        </div>
      </div>

      {/* Occupancy summary */}
      <p className="mt-1 text-xs text-white/40">
        {occupiedCount} of {tables.length} tables occupied
      </p>

      {/* Grid */}
      {isLoading ? (
        <p className="mt-5 py-6 text-sm text-white/40">Loading tables...</p>
      ) : error ? (
        <p className="mt-5 py-6 text-sm text-red-400">{error}</p>
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-3">
          {tables.map((table) => {
            const isOccupied = table.status === "OCCUPIED";

            return (
              <div
                key={table.id}
                className={`rounded-xl p-4 border transition-colors ${
                  isOccupied
                    ? "bg-[#fbbf24]/10 border-[#fbbf24]/30"
                    : "bg-white/2 border-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium tracking-wide text-white/40">
                    TABLE
                  </span>
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isOccupied ? "bg-[#fbbf24]" : "bg-emerald-400"
                    }`}
                  />
                </div>

                <p className="mt-2 text-2xl font-bold text-white">
                  {String(table.tableNumber).padStart(2, "0")}
                </p>

                <p
                  className={`mt-1 text-xs font-medium ${
                    isOccupied ? "text-[#fbbf24]" : "text-emerald-400"
                  }`}
                >
                  {isOccupied ? "Occupied" : "Available"}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer action */}
      <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/2 py-3 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors">
        <Icons.tables className="h-4 w-4" />
        View All Tables
      </button>
    </div>
  );
}

export default TableStatus;
