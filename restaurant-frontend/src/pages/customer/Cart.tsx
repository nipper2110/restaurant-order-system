import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Minus, Plus, Trash2 } from "lucide-react";

import { getErrorMessage } from "@/api";
import { confirmOrder, getOrder, verifyTable, type TableSession } from "@/api/customer";
import type { OrderDetail, OrderItemDetail } from "@/types";
import { useCart } from "./cartContextStore";

function formatCurrency(value: string | number) {
  return `฿${Number(value).toLocaleString()}`;
}

function imageUrl(path: string) {
  return `${import.meta.env.VITE_IMG_URL}${path}`;
}

function formatBatchTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Cart() {
  const { qrToken } = useParams<{ qrToken: string }>();
  const navigate = useNavigate();
  const cart = useCart();

  const [session, setSession] = useState<TableSession | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    if (!qrToken) return;
    let isMounted = true;

    verifyTable(qrToken)
      .then(async (sessionData) => {
        if (!isMounted) return;
        setSession(sessionData);
        const orderData = await getOrder(sessionData.orderId, sessionData.tableId);
        if (isMounted) setOrder(orderData);
      })
      .catch((err) => {
        if (isMounted)
          setLoadError(getErrorMessage(err, "Failed to load your order."));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [qrToken]);

  const batches = useMemo(() => {
    if (!order) return [];
    const groups = new Map<number, OrderItemDetail[]>();
    for (const item of order.orderItems) {
      if (!groups.has(item.batchNumber)) groups.set(item.batchNumber, []);
      groups.get(item.batchNumber)!.push(item);
    }
    return Array.from(groups.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([batchNumber, items]) => ({
        batchNumber,
        items,
        subtotal: items.reduce((sum, i) => sum + Number(i.price), 0),
        confirmedAt: items[0].createdAt,
      }));
  }, [order]);

  const handleConfirm = async () => {
    if (!session || cart.items.length === 0) return;

    setConfirmError(null);
    setIsConfirming(true);
    try {
      await confirmOrder(
        session.orderId,
        session.tableId,
        cart.items.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          note: i.note,
          productOptionIds: i.productOptionIds,
        })),
      );
      cart.clearCart();
      const updated = await getOrder(session.orderId, session.tableId);
      setOrder(updated);
    } catch (err) {
      setConfirmError(getErrorMessage(err, "Failed to confirm your order."));
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 text-center">
        <p className="text-sm text-white/40">Loading your order...</p>
      </div>
    );
  }

  if (loadError || !session) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-lg font-semibold text-white">
          We couldn't load your order
        </p>
        <p className="text-sm text-white/50">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-10">
      <h1 className="text-xl font-bold text-[#fbbf24]">Your Order</h1>
      <p className="text-sm text-gray-400">
        Table {String(session.tableNumber).padStart(2, "0")}
      </p>

      {/* Pending cart */}
      <section className="mt-5">
        <h2 className="mb-3 text-sm font-semibold text-white/70">
          In Your Cart
        </h2>
        {cart.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center">
            <p className="text-sm text-white/40">Your cart is empty.</p>
            <button
              onClick={() => navigate(`/order/${qrToken}`)}
              className="mt-2 text-sm font-medium text-[#fbbf24]"
            >
              Browse the menu
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {cart.items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#1a1a1a] p-3"
                >
                  <img
                    src={imageUrl(item.image)}
                    alt={item.name}
                    className="h-14 w-14 shrink-0 rounded-xl object-cover bg-white/5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">
                      {item.name}
                    </p>
                    {item.optionsLabel && (
                      <p className="text-xs text-white/40">
                        {item.optionsLabel}
                      </p>
                    )}
                    {item.note && (
                      <p className="text-xs text-[#fbbf24]/80">{item.note}</p>
                    )}
                    <div className="mt-1.5 flex items-center gap-3">
                      <button
                        onClick={() =>
                          cart.updateQuantity(
                            item.cartItemId,
                            item.quantity - 1,
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-white disabled:opacity-30"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          cart.updateQuantity(
                            item.cartItemId,
                            item.quantity + 1,
                          )
                        }
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fbbf24] text-black"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-semibold text-white tabular-nums">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                    <button
                      onClick={() => cart.removeItem(item.cartItemId)}
                      className="text-red-400/60 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {confirmError && (
              <p className="mt-3 text-sm text-red-400">{confirmError}</p>
            )}

            <button
              onClick={handleConfirm}
              disabled={isConfirming}
              className="mt-4 flex w-full items-center justify-between rounded-2xl bg-[#fbbf24] px-5 py-4 text-black disabled:opacity-50"
            >
              <span className="text-sm font-semibold">
                {isConfirming ? "Confirming..." : "Confirm Order"}
              </span>
              <span className="text-sm font-semibold tabular-nums">
                {formatCurrency(cart.subtotal)}
              </span>
            </button>
          </>
        )}
      </section>

      {/* Order history */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-white/70">
          Order History
        </h2>
        {batches.length === 0 ? (
          <p className="text-sm text-white/40">
            Nothing confirmed yet — items you confirm will show up here.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {batches.map((batch) => (
              <div
                key={batch.batchNumber}
                className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-4"
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/70">
                    Round {batch.batchNumber}
                  </span>
                  <span className="text-xs text-white/40">
                    {formatBatchTime(batch.confirmedAt)}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {batch.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-white/80">
                          {item.quantity}x {item.menuItem.name}
                        </p>
                        {item.productOptions.length > 0 && (
                          <p className="text-xs text-white/40">
                            {item.productOptions.map((o) => o.name).join(", ")}
                          </p>
                        )}
                        {item.note && (
                          <p className="text-xs text-[#fbbf24]/70">
                            {item.note}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-sm text-white/70 tabular-nums">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5">
                  <span className="text-xs text-white/40">Subtotal</span>
                  <span className="text-sm font-semibold text-white tabular-nums">
                    {formatCurrency(batch.subtotal)}
                  </span>
                </div>
              </div>
            ))}

            {order && (
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-semibold text-white">
                  Order Total
                </span>
                <span className="text-base font-semibold text-[#fbbf24] tabular-nums">
                  {formatCurrency(order.totalPrice)}
                </span>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Cart;
