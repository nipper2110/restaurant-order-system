import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { Plus, ShoppingBag } from "lucide-react";

import { getErrorMessage } from "@/api";
import {
  addOrderItem,
  getMenuItems,
  getOrder,
  verifyTable,
  type TableSession,
} from "@/api/customer";
import type { MenuItem, OrderDetail } from "@/types";

function formatCurrency(value: string | number) {
  return `฿${Number(value).toLocaleString()}`;
}

function imageUrl(path: string) {
  return `${import.meta.env.VITE_IMG_URL}${path}`;
}

function TableMenu() {
  const { qrToken } = useParams<{ qrToken: string }>();

  const [session, setSession] = useState<TableSession | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    if (!qrToken) return;
    let isMounted = true;

    verifyTable(qrToken)
      .then((data) => {
        if (isMounted) setSession(data);
      })
      .catch((err) => {
        if (isMounted)
          setVerifyError(
            getErrorMessage(err, "This QR code is invalid or expired."),
          );
      })
      .finally(() => {
        if (isMounted) setIsVerifying(false);
      });

    return () => {
      isMounted = false;
    };
  }, [qrToken]);

  useEffect(() => {
    if (!session) return;
    let isMounted = true;

    Promise.all([
      getMenuItems(),
      getOrder(session.orderId, session.tableId),
    ])
      .then(([items, orderData]) => {
        if (!isMounted) return;
        setMenuItems(items);
        setOrder(orderData);
      })
      .catch((err) => {
        if (isMounted)
          setMenuError(getErrorMessage(err, "Failed to load the menu."));
      })
      .finally(() => {
        if (isMounted) setIsLoadingMenu(false);
      });

    return () => {
      isMounted = false;
    };
  }, [session]);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, MenuItem[]>();
    for (const item of menuItems) {
      const key = item.category.name;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    return groups;
  }, [menuItems]);

  const categoryNames = useMemo(
    () => Array.from(groupedItems.keys()),
    [groupedItems],
  );
  const visibleCategories = activeCategory
    ? [activeCategory]
    : categoryNames;

  const handleAddItem = async (item: MenuItem) => {
    if (!session) return;

    setAddError(null);
    setAddingId(item.id);
    try {
      await addOrderItem(session.orderId, {
        tableId: session.tableId,
        menuItemId: item.id,
        quantity: 1,
      });
      const updatedOrder = await getOrder(session.orderId, session.tableId);
      setOrder(updatedOrder);
    } catch (err) {
      setAddError(getErrorMessage(err, "Failed to add item to your order."));
    } finally {
      setAddingId(null);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 text-center">
        <p className="text-sm text-white/40">Finding your table...</p>
      </div>
    );
  }

  if (verifyError || !session) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-lg font-semibold text-white">
          We couldn't find your table
        </p>
        <p className="text-sm text-white/50">{verifyError}</p>
        <p className="mt-2 text-xs text-white/30">
          Please scan the QR code on your table again.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#fbbf24]">
          Table {String(session.tableNumber).padStart(2, "0")}
        </h1>
        <p className="text-sm text-gray-400">
          Browse the menu and tap + to add items to your order.
        </p>
      </div>

      {addError && (
        <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {addError}
        </div>
      )}

      {isLoadingMenu ? (
        <p className="py-10 text-center text-sm text-white/40">
          Loading menu...
        </p>
      ) : menuError ? (
        <p className="py-10 text-center text-sm text-red-400">{menuError}</p>
      ) : menuItems.length === 0 ? (
        <p className="py-10 text-center text-sm text-white/40">
          The menu isn't available right now.
        </p>
      ) : (
        <>
          {categoryNames.length > 1 && (
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveCategory(null)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === null
                    ? "bg-[#fbbf24] text-black"
                    : "border border-white/10 text-white/60"
                }`}
              >
                All
              </button>
              {categoryNames.map((name) => (
                <button
                  key={name}
                  onClick={() => setActiveCategory(name)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    activeCategory === name
                      ? "bg-[#fbbf24] text-black"
                      : "border border-white/10 text-white/60"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-6">
            {visibleCategories.map((categoryName) => (
              <section key={categoryName}>
                <h2 className="mb-3 text-sm font-semibold text-white/70">
                  {categoryName}
                </h2>
                <div className="flex flex-col gap-3">
                  {groupedItems.get(categoryName)!.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#1a1a1a] p-3"
                    >
                      <img
                        src={imageUrl(item.image)}
                        alt={item.name}
                        className="h-16 w-16 shrink-0 rounded-xl object-cover bg-white/5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">
                          {item.name}
                        </p>
                        <p className="line-clamp-2 text-xs text-white/40">
                          {item.description}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm font-semibold text-white tabular-nums">
                            {formatCurrency(item.price)}
                          </span>
                          {!item.isAvailable && (
                            <span className="rounded-full bg-red-400/10 px-2 py-0.5 text-[10px] font-medium text-red-400">
                              Unavailable
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddItem(item)}
                        disabled={!item.isAvailable || addingId === item.id}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fbbf24] text-black disabled:opacity-30"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}

      {order && order.orderItems.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md items-center justify-between border-t border-white/10 bg-[#1a1a1a] px-4 py-3.5">
          <span className="flex items-center gap-2 text-sm text-white/70">
            <ShoppingBag className="h-4 w-4 text-[#fbbf24]" />
            {order.orderItems.length}{" "}
            {order.orderItems.length === 1 ? "item" : "items"}
          </span>
          <span className="text-base font-semibold text-[#fbbf24] tabular-nums">
            {formatCurrency(order.totalPrice)}
          </span>
        </div>
      )}
    </div>
  );
}

export default TableMenu;
