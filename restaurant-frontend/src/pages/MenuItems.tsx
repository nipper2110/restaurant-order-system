import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/api";
import { deleteMenuItem, getMenuItems, updateMenuItem } from "@/api/menuItems";
import type { MenuItem } from "@/types";

const PAGE_SIZE = 8;

function formatCurrency(value: string) {
  return `฿${Number(value).toLocaleString()}`;
}

function imageUrl(path: string) {
  return `${import.meta.env.VITE_IMG_URL}${path}`;
}

function MenuItems() {
  const navigate = useNavigate();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const fetchItems = () => {
    return getMenuItems()
      .then((data) => {
        setItems(data);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(getErrorMessage(err, "Failed to load menu items."));
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    let isMounted = true;
    getMenuItems()
      .then((data) => {
        if (isMounted) {
          setItems(data);
          setLoadError(null);
        }
      })
      .catch((err) => {
        if (isMounted)
          setLoadError(getErrorMessage(err, "Failed to load menu items."));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = items.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const availableCount = items.filter((i) => i.isAvailable).length;
  const unavailableCount = items.length - availableCount;

  const handleToggleAvailability = async (item: MenuItem) => {
    setActionError(null);
    setPendingId(item.id);
    try {
      await updateMenuItem({
        menuItemId: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        isAvailable: !item.isAvailable,
        category: item.category.name,
      });
      await fetchItems();
    } catch (err) {
      setActionError(getErrorMessage(err, "Failed to update availability."));
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) {
      return;
    }

    setActionError(null);
    setPendingId(item.id);
    try {
      await deleteMenuItem(item.id);
      await fetchItems();
      setPage((p) => Math.min(p, Math.max(1, Math.ceil((items.length - 1) / PAGE_SIZE))));
    } catch (err) {
      setActionError(getErrorMessage(err, "Failed to delete menu item."));
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="pb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-xl text-[#fbbf24]">Menu Items</h1>
          <span className="text-sm text-gray-400">
            Manage your restaurant menu — add, edit, and toggle availability.
          </span>
        </div>
        <Button
          size="lg"
          onClick={() => navigate("/menuItems/new")}
          className="bg-[#fbbf24] text-black hover:bg-[#fbbf24]/80"
        >
          <Plus className="h-4 w-4" />
          Add Menu Item
        </Button>
      </div>

      {!isLoading && !loadError && (
        <div className="pb-4 flex items-center gap-4 text-sm">
          <span className="text-white/50">{items.length} items total</span>
          <span className="text-emerald-400">{availableCount} available</span>
          <span className="text-red-400">{unavailableCount} unavailable</span>
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {actionError}
        </div>
      )}

      <div className="rounded-2xl bg-[#1a1a1a] border border-white/10 overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-sm text-white/40">Loading menu items...</p>
        ) : loadError ? (
          <p className="p-6 text-sm text-red-400">{loadError}</p>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-white/40">No menu items yet.</p>
            <Button
              size="sm"
              onClick={() => navigate("/menuItems/new")}
              className="mt-4 bg-[#fbbf24] text-black hover:bg-[#fbbf24]/80"
            >
              <Plus className="h-3.5 w-3.5" />
              Add your first item
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-3 text-xs font-medium tracking-wide text-white/40">
                      ITEM
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wide text-white/40">
                      CATEGORY
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wide text-white/40">
                      PRICE
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wide text-white/40">
                      AVAILABILITY
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wide text-white/40 text-right">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={imageUrl(item.image)}
                            alt={item.name}
                            className="h-12 w-12 rounded-lg object-cover bg-white/5"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white">
                              {item.name}
                            </p>
                            <p className="truncate max-w-xs text-xs text-white/40">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/60">
                        {item.category.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-white tabular-nums">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            item.isAvailable
                              ? "bg-emerald-400/10 text-emerald-400"
                              : "bg-red-400/10 text-red-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              item.isAvailable ? "bg-emerald-400" : "bg-red-400"
                            }`}
                          />
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() =>
                              navigate(`/menuItems/${item.id}/edit`)
                            }
                            title="View / edit"
                            className="text-white/40 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/menuItems/${item.id}/edit`)
                            }
                            title="Edit"
                            className="text-white/40 hover:text-white"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleAvailability(item)}
                            disabled={pendingId === item.id}
                            title={
                              item.isAvailable
                                ? "Mark unavailable"
                                : "Mark available"
                            }
                            className={`disabled:opacity-40 ${
                              item.isAvailable
                                ? "text-[#fbbf24] hover:text-[#fbbf24]/80"
                                : "text-emerald-400 hover:text-emerald-300"
                            }`}
                          >
                            {item.isAvailable ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            disabled={pendingId === item.id}
                            title="Delete"
                            className="text-red-400/70 hover:text-red-400 disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
              <span className="text-xs text-white/40">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, items.length)} of{" "}
                {items.length} items
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
  );
}

export default MenuItems;
