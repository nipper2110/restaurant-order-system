import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Minus, Plus } from "lucide-react";

import { getErrorMessage } from "@/api";
import { getMenuItem, verifyTable, type TableSession } from "@/api/customer";
import type { MenuItemDetail } from "@/types";
import { useCart } from "./cartContextStore";

function formatCurrency(value: number) {
  return `฿${value.toLocaleString()}`;
}

function imageUrl(path: string) {
  return `${import.meta.env.VITE_IMG_URL}${path}`;
}

function ItemDetail() {
  const { qrToken, itemId } = useParams<{ qrToken: string; itemId: string }>();
  const navigate = useNavigate();
  const cart = useCart();

  const [session, setSession] = useState<TableSession | null>(null);
  const [item, setItem] = useState<MenuItemDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selections, setSelections] = useState<Record<number, number>>({});
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!qrToken || !itemId) return;
    let isMounted = true;

    Promise.all([verifyTable(qrToken), getMenuItem(Number(itemId))])
      .then(([sessionData, itemData]) => {
        if (!isMounted) return;
        setSession(sessionData);
        setItem(itemData);
      })
      .catch((err) => {
        if (isMounted)
          setLoadError(getErrorMessage(err, "Failed to load this item."));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [qrToken, itemId]);

  const selectedOptionIds = useMemo(
    () => Object.values(selections),
    [selections],
  );

  const missingRequiredCategory = useMemo(() => {
    if (!item) return null;
    return (
      item.productOptionCategory.find(
        (category) => category.isRequired && !selections[category.id],
      ) ?? null
    );
  }, [item, selections]);

  const unitPrice = useMemo(() => {
    if (!item) return 0;
    const optionsTotal = (item.productOptionCategory ?? [])
      .flatMap((c) => c.options)
      .filter((o) => selectedOptionIds.includes(o.id))
      .reduce((sum, o) => sum + Number(o.additionalPrice), 0);
    return Number(item.price) + optionsTotal;
  }, [item, selectedOptionIds]);

  const totalPrice = unitPrice * quantity;

  const handleSelect = (categoryId: number, optionId: number) => {
    setSelections((prev) => ({ ...prev, [categoryId]: optionId }));
  };

  const handleSubmit = () => {
    if (!session || !item || missingRequiredCategory) return;

    const optionsLabel = (item.productOptionCategory ?? [])
      .flatMap((c) => c.options)
      .filter((o) => selectedOptionIds.includes(o.id))
      .map((o) => o.name)
      .join(", ");

    cart.addItem({
      menuItemId: item.id,
      name: item.name,
      image: item.image,
      unitPrice,
      quantity,
      note: note.trim() || undefined,
      productOptionIds: selectedOptionIds,
      optionsLabel,
    });
    navigate(`/order/${qrToken}`, { replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 text-center">
        <p className="text-sm text-white/40">Loading item...</p>
      </div>
    );
  }

  if (loadError || !item || !session) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-lg font-semibold text-white">
          We couldn't load this item
        </p>
        <p className="text-sm text-white/50">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <div className="relative h-64 w-full bg-white/5">
        <img
          src={imageUrl(item.image)}
          alt={item.name}
          className="h-full w-full object-cover"
        />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-white">{item.name}</h1>
          <span className="shrink-0 text-lg font-semibold text-[#fbbf24] tabular-nums">
            {formatCurrency(Number(item.price))}
          </span>
        </div>
        {item.description && (
          <p className="mt-1.5 text-sm text-white/50">{item.description}</p>
        )}

        {item.productOptionCategory.map((category) => (
          <div key={category.id} className="mt-6">
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                {category.name}
              </h2>
              <span
                className={`text-xs font-medium ${
                  category.isRequired ? "text-red-400" : "text-white/40"
                }`}
              >
                {category.isRequired ? "Required" : "Optional"}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {category.options.map((option) => {
                const isSelected = selections[category.id] === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(category.id, option.id)}
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-3 text-left transition-colors ${
                      isSelected
                        ? "border-[#fbbf24] bg-[#fbbf24]/10"
                        : "border-white/10 bg-[#1a1a1a]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-[#fbbf24] bg-[#fbbf24]"
                            : "border-white/30"
                        }`}
                      >
                        {isSelected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-black" />
                        )}
                      </span>
                      <span className="text-sm text-white">{option.name}</span>
                    </span>
                    <span className="text-xs text-white/40 tabular-nums">
                      {Number(option.additionalPrice) > 0
                        ? `+${formatCurrency(Number(option.additionalPrice))}`
                        : "Included"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-6">
          <h2 className="mb-2.5 text-sm font-semibold text-white">
            Special Instructions
          </h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. no onions, extra sauce..."
            rows={2}
            className="w-full resize-none rounded-xl border border-white/10 bg-[#1a1a1a] px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#fbbf24] focus:outline-none"
          />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Quantity</h2>
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-4 text-center text-sm text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fbbf24] text-black"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md px-4 pb-4">
        <button
          onClick={handleSubmit}
          disabled={!!missingRequiredCategory}
          className="flex w-full items-center justify-between rounded-2xl bg-[#1a1a1a] px-5 py-4 disabled:opacity-50"
        >
          <span className="text-sm font-semibold text-white">
            {missingRequiredCategory
              ? `Select ${missingRequiredCategory.name}`
              : "Add to Cart"}
          </span>
          <span className="rounded-full bg-[#fbbf24] px-3 py-1 text-sm font-semibold text-black tabular-nums">
            {formatCurrency(totalPrice)}
          </span>
        </button>
      </div>
    </div>
  );
}

export default ItemDetail;
