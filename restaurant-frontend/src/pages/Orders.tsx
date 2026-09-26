import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  RefreshCw,
  Search,
  Table2,
  X,
} from "lucide-react";

import { getErrorMessage } from "@/api";
import { getOrder, getOrders } from "@/api/orders";
import type { Order, OrderDetail } from "@/types";

const PAGE_SIZE = 8;
const AUTO_REFRESH_INTERVAL_MS = 20000;

type DateFilter = "today" | "all";
type SortOption = "newest" | "oldest" | "highest" | "lowest";

function formatCurrency(value: string | number) {
  return `฿${Number(value).toLocaleString()}`;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function orderLabel(id: number) {
  return `#ORD-${String(id).padStart(4, "0")}`;
}

function isToday(value: string) {
  const date = new Date(value);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [page, setPage] = useState(1);

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const fetchOrders = () => {
    return getOrders()
      .then((data) => {
        setOrders(data);
        setLoadError(null);
        setSelectedOrderId((prev) =>
          prev === null && data.length > 0 ? data[0].id : prev,
        );
      })
      .catch((err) => {
        setLoadError(getErrorMessage(err, "Failed to load orders."));
      });
  };

  useEffect(() => {
    let isMounted = true;

    getOrders()
      .then((data) => {
        if (!isMounted) return;
        setOrders(data);
        setLoadError(null);
        if (data.length > 0) {
          setSelectedOrderId(data[0].id);
          setIsLoadingDetail(true);
        }
      })
      .catch((err) => {
        if (isMounted)
          setLoadError(getErrorMessage(err, "Failed to load orders."));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchOrders, AUTO_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const selectOrder = (id: number) => {
    setSelectedOrderId(id);
    setIsLoadingDetail(true);
    setDetailError(null);
  };

  useEffect(() => {
    if (selectedOrderId === null) return;

    let isMounted = true;

    getOrder(selectedOrderId)
      .then((data) => {
        if (isMounted) setSelectedOrder(data);
      })
      .catch((err) => {
        if (isMounted)
          setDetailError(getErrorMessage(err, "Failed to load order."));
      })
      .finally(() => {
        if (isMounted) setIsLoadingDetail(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedOrderId]);

  const tableNumbers = useMemo(
    () =>
      Array.from(new Set(orders.map((o) => o.table.tableNumber))).sort(
        (a, b) => a - b,
      ),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (dateFilter === "today") {
      result = result.filter((o) => isToday(o.createdAt));
    }

    if (tableFilter !== "all") {
      result = result.filter(
        (o) => String(o.table.tableNumber) === tableFilter,
      );
    }

    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (o) =>
          orderLabel(o.id).toLowerCase().includes(term) ||
          String(o.table.tableNumber).includes(term),
      );
    }

    const sorted = [...result];
    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => b.id - a.id);
        break;
      case "oldest":
        sorted.sort((a, b) => a.id - b.id);
        break;
      case "highest":
        sorted.sort((a, b) => Number(b.totalPrice) - Number(a.totalPrice));
        break;
      case "lowest":
        sorted.sort((a, b) => Number(a.totalPrice) - Number(b.totalPrice));
        break;
    }

    return sorted;
  }, [orders, dateFilter, tableFilter, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const totalRevenue = filteredOrders.reduce(
    (sum, o) => sum + Number(o.totalPrice),
    0,
  );

  const subtotal = selectedOrder
    ? selectedOrder.orderItems.reduce((sum, item) => sum + Number(item.price), 0)
    : 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search orders..."
            className="h-10 w-full rounded-lg border border-white/10 bg-[#1a1a1a] pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#fbbf24]/60"
          />
        </div>

        <select
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value as DateFilter);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-sm text-white outline-none focus:border-[#fbbf24]/60"
        >
          <option value="today">Today</option>
          <option value="all">All Time</option>
        </select>

        <select
          value={tableFilter}
          onChange={(e) => {
            setTableFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-sm text-white outline-none focus:border-[#fbbf24]/60"
        >
          <option value="all">All Tables</option>
          {tableNumbers.map((n) => (
            <option key={n} value={n}>
              Table {String(n).padStart(2, "0")}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="h-10 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-sm text-white outline-none focus:border-[#fbbf24]/60"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Total</option>
          <option value="lowest">Lowest Total</option>
        </select>

        <button
          onClick={() => setAutoRefresh((v) => !v)}
          className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
            autoRefresh
              ? "border-[#fbbf24]/40 bg-[#fbbf24]/10 text-[#fbbf24]"
              : "border-white/10 bg-[#1a1a1a] text-white/50"
          }`}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Auto-refresh: {autoRefresh ? "On" : "Off"}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left: list */}
        <div className="xl:col-span-2">
          <div className="pb-4">
            <h1 className="font-bold text-xl text-[#fbbf24]">Orders</h1>
            <p className="text-sm text-gray-400">
              {dateFilter === "today"
                ? "All customer orders placed today."
                : "All customer orders."}{" "}
              Click any row to view details.
            </p>
          </div>

          {!isLoading && !loadError && (
            <div className="pb-4 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-white/50">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {filteredOrders.length} orders
                {dateFilter === "today" ? " today" : ""}
              </span>
              <span className="text-white font-medium">
                Total Revenue: {formatCurrency(totalRevenue)}
              </span>
            </div>
          )}

          <div className="rounded-2xl bg-[#1a1a1a] border border-white/10 overflow-hidden">
            {isLoading ? (
              <p className="p-6 text-sm text-white/40">Loading orders...</p>
            ) : loadError ? (
              <p className="p-6 text-sm text-red-400">{loadError}</p>
            ) : filteredOrders.length === 0 ? (
              <p className="p-6 text-sm text-white/40">
                No orders match these filters.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="px-6 py-3 text-xs font-medium tracking-wide text-white/40">
                          ORDER ID
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wide text-white/40">
                          TABLE
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wide text-white/40">
                          ITEMS
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wide text-white/40">
                          TOTAL
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wide text-white/40">
                          TIME
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wide text-white/40 text-right">
                          ACTION
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageOrders.map((order) => {
                        const isSelected = order.id === selectedOrderId;
                        return (
                          <tr
                            key={order.id}
                            onClick={() => selectOrder(order.id)}
                            className={`cursor-pointer border-b border-white/5 last:border-0 transition-colors ${
                              isSelected ? "bg-white/5" : "hover:bg-white/5"
                            }`}
                          >
                            <td className="px-6 py-4 text-sm font-medium text-white">
                              {orderLabel(order.id)}
                            </td>
                            <td className="px-6 py-4 text-sm text-white/60">
                              <span className="inline-flex items-center gap-1.5">
                                <Table2 className="h-3.5 w-3.5 text-white/30" />
                                Table{" "}
                                {String(order.table.tableNumber).padStart(
                                  2,
                                  "0",
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-white/60">
                              {order.orderItems.length} items
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-white tabular-nums">
                              {formatCurrency(order.totalPrice)}
                            </td>
                            <td className="px-6 py-4 text-sm text-white/40">
                              {formatTime(order.createdAt)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectOrder(order.id);
                                }}
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                  isSelected
                                    ? "bg-[#fbbf24] text-black"
                                    : "border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                  <span className="text-xs text-white/40">
                    Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)}{" "}
                    of {filteredOrders.length} orders
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:text-white disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${
                            p === currentPage
                              ? "bg-[#fbbf24] text-black"
                              : "border border-white/10 text-white/50 hover:text-white"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:text-white disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: order details */}
        <div className="rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 xl:sticky xl:top-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <p className="text-xs font-medium tracking-wide text-white/40">
                ORDER DETAILS
              </p>
              <p className="mt-0.5 text-lg font-semibold text-white">
                {selectedOrder ? orderLabel(selectedOrder.id) : "—"}
              </p>
            </div>
            {selectedOrderId !== null && (
              <button
                onClick={() => {
                  setSelectedOrderId(null);
                  setSelectedOrder(null);
                  setDetailError(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {isLoadingDetail ? (
            <p className="py-6 text-sm text-white/40">Loading order...</p>
          ) : detailError ? (
            <p className="py-6 text-sm text-red-400">{detailError}</p>
          ) : !selectedOrder ? (
            <p className="py-6 text-sm text-white/40">
              Select an order to view its details.
            </p>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/40">Table</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    Table{" "}
                    {String(selectedOrder.table.tableNumber).padStart(2, "0")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Placed At</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {formatTime(selectedOrder.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Items</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {selectedOrder.orderItems.length} items
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Total</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {formatCurrency(selectedOrder.totalPrice)}
                  </p>
                </div>
              </div>

              <p className="mt-6 mb-3 text-xs font-medium tracking-wide text-white/40">
                ORDER ITEMS
              </p>
              <div className="flex flex-col gap-4">
                {selectedOrder.orderItems.length === 0 ? (
                  <p className="text-sm text-white/40">No items.</p>
                ) : (
                  selectedOrder.orderItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <span className="mt-0.5 text-sm font-medium text-white/50">
                        {item.quantity}x
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-white">
                            {item.menuItem.name}
                          </p>
                          <p className="text-sm font-semibold text-white tabular-nums">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        {item.productOptions.length > 0 && (
                          <p className="text-xs text-white/40">
                            {item.productOptions.map((o) => o.name).join(", ")}
                          </p>
                        )}
                        {item.note && (
                          <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-[#fbbf24]/10 px-2.5 py-1 text-xs text-[#fbbf24]">
                            <MessageSquare className="h-3 w-3" />
                            {item.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Subtotal</span>
                  <span className="text-white">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-[#fbbf24]">
                    {formatCurrency(selectedOrder.totalPrice)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Orders;
