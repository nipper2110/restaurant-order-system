import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Pencil, Plus, Printer, RefreshCw, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/api";
import {
  createTable,
  deleteTable,
  getTables,
  regenerateTableQrCode,
  updateTable,
} from "@/api/tables";
import type { RestaurantTable } from "@/types";

function tableUrl(qrCode: string) {
  return `${window.location.origin}/order/${qrCode}`;
}

function Tables() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [newTableNumber, setNewTableNumber] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingNumber, setEditingNumber] = useState("");
  const [rowError, setRowError] = useState<Record<number, string>>({});
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());

  const [printTable, setPrintTable] = useState<RestaurantTable | null>(null);

  const fetchTables = () => {
    return getTables()
      .then((data) => {
        setTables(data);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(getErrorMessage(err, "Failed to load tables."));
      });
  };

  useEffect(() => {
    fetchTables().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!printTable) return;
    const handleAfterPrint = () => setPrintTable(null);
    window.addEventListener("afterprint", handleAfterPrint);
    window.print();
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, [printTable]);

  const withBusy = async (id: number, task: () => Promise<void>) => {
    setBusyIds((prev) => new Set(prev).add(id));
    setRowError((prev) => ({ ...prev, [id]: "" }));
    try {
      await task();
    } catch (err) {
      setRowError((prev) => ({
        ...prev,
        [id]: getErrorMessage(err, "Something went wrong."),
      }));
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleAddTable = async () => {
    const tableNumber = Number(newTableNumber);
    if (!tableNumber || tableNumber < 1) {
      setAddError("Enter a valid table number.");
      return;
    }

    setAddError(null);
    setIsAdding(true);
    try {
      await createTable(tableNumber);
      setNewTableNumber("");
      await fetchTables();
    } catch (err) {
      setAddError(getErrorMessage(err, "Failed to add table."));
    } finally {
      setIsAdding(false);
    }
  };

  const startEdit = (table: RestaurantTable) => {
    setEditingId(table.id);
    setEditingNumber(String(table.tableNumber));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingNumber("");
  };

  const saveEdit = (table: RestaurantTable) => {
    const tableNumber = Number(editingNumber);
    if (!tableNumber || tableNumber < 1) {
      setRowError((prev) => ({ ...prev, [table.id]: "Invalid table number." }));
      return;
    }

    withBusy(table.id, async () => {
      await updateTable({ tableId: table.id, tableNumber });
      setEditingId(null);
      await fetchTables();
    });
  };

  const toggleStatus = (table: RestaurantTable) => {
    withBusy(table.id, async () => {
      await updateTable({
        tableId: table.id,
        status: table.status === "OCCUPIED" ? "AVAILABLE" : "OCCUPIED",
      });
      await fetchTables();
    });
  };

  const handleRegenerate = (table: RestaurantTable) => {
    if (
      !window.confirm(
        `Regenerate the QR code for Table ${table.tableNumber}? The old printed code will stop working immediately.`,
      )
    ) {
      return;
    }
    withBusy(table.id, async () => {
      await regenerateTableQrCode(table.id);
      await fetchTables();
    });
  };

  const handleDelete = (table: RestaurantTable) => {
    if (
      !window.confirm(
        `Delete Table ${table.tableNumber}? This can't be undone.`,
      )
    ) {
      return;
    }
    withBusy(table.id, async () => {
      await deleteTable(table.id);
      await fetchTables();
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: fixed;
            inset: 0;
            display: flex !important;
          }
        }
      `}</style>

      {printTable && (
        <div
          id="print-area"
          className="hidden flex-col items-center justify-center gap-4 bg-white py-20 text-black"
        >
          <p className="text-2xl font-bold">
            Table {String(printTable.tableNumber).padStart(2, "0")}
          </p>
          <QRCodeSVG value={tableUrl(printTable.qrCode)} size={280} />
          <p className="text-sm text-gray-600">Scan to view the menu and order</p>
        </div>
      )}

      <div className="pb-6">
        <h1 className="font-bold text-xl text-[#fbbf24]">Tables</h1>
        <p className="text-sm text-gray-400">
          Create tables, print their QR codes, and manage their status.
        </p>
      </div>

      <div className="mb-6 rounded-2xl bg-[#1a1a1a] border border-white/10 p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-sm text-white/70">New Table Number</label>
            <input
              type="number"
              min={1}
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
              placeholder="e.g. 6"
              className="mt-1.5 h-10 w-40 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#fbbf24]/60"
            />
          </div>
          <Button
            onClick={handleAddTable}
            disabled={isAdding}
            className="bg-[#fbbf24] text-black hover:bg-[#fbbf24]/80"
          >
            <Plus className="h-4 w-4" />
            {isAdding ? "Adding..." : "Add Table"}
          </Button>
        </div>
        {addError && <p className="mt-2 text-sm text-red-400">{addError}</p>}
      </div>

      {isLoading ? (
        <p className="text-sm text-white/40">Loading tables...</p>
      ) : loadError ? (
        <p className="text-sm text-red-400">{loadError}</p>
      ) : tables.length === 0 ? (
        <p className="text-sm text-white/40">No tables yet. Add one above.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tables.map((table) => (
            <div
              key={table.id}
              className="rounded-2xl bg-[#1a1a1a] border border-white/10 p-5"
            >
              <div className="flex items-start justify-between">
                {editingId === table.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      type="number"
                      min={1}
                      value={editingNumber}
                      onChange={(e) => setEditingNumber(e.target.value)}
                      className="h-8 w-20 rounded-lg border border-white/10 bg-white/5 px-2 text-sm text-white outline-none focus:border-[#fbbf24]/60"
                    />
                    <button
                      onClick={() => saveEdit(table)}
                      disabled={busyIds.has(table.id)}
                      className="text-emerald-400 hover:text-emerald-300 disabled:opacity-40"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-white/40 hover:text-white/70"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-white">
                      Table {String(table.tableNumber).padStart(2, "0")}
                    </h2>
                    <button
                      onClick={() => startEdit(table)}
                      className="text-white/30 hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => toggleStatus(table)}
                  disabled={busyIds.has(table.id)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-40 ${
                    table.status === "OCCUPIED"
                      ? "bg-[#fbbf24]/15 text-[#fbbf24]"
                      : "bg-emerald-400/10 text-emerald-400"
                  }`}
                >
                  {table.status === "OCCUPIED" ? "Occupied" : "Available"}
                </button>
              </div>

              <div className="mt-4 flex justify-center rounded-xl bg-white p-4">
                <QRCodeSVG value={tableUrl(table.qrCode)} size={140} />
              </div>

              {rowError[table.id] && (
                <p className="mt-3 text-xs text-red-400">
                  {rowError[table.id]}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPrintTable(table)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </button>
                <button
                  onClick={() => handleRegenerate(table)}
                  disabled={busyIds.has(table.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-40"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate
                </button>
                <button
                  onClick={() => handleDelete(table)}
                  disabled={busyIds.has(table.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-red-400/20 px-3 py-1.5 text-xs font-medium text-red-400/80 hover:bg-red-400/10 hover:text-red-400 disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Tables;
