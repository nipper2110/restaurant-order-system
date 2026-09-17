import { useState } from "react";
import { Check, Pencil, Plus, X } from "lucide-react";

import { getErrorMessage } from "@/api";
import type { Category } from "@/types";

interface CategoriesPanelProps {
  categories: Category[];
  isLoading: boolean;
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: number, name: string) => Promise<void>;
}

function CategoriesPanel({
  categories,
  isLoading,
  onCreate,
  onUpdate,
}: CategoriesPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAdd = () => {
    setEditingId(null);
    setIsAdding(true);
    setNewName("");
    setError(null);
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewName("");
  };

  const submitAdd = async () => {
    const name = newName.trim();
    if (!name) return;

    setIsSaving(true);
    setError(null);
    try {
      await onCreate(name);
      setIsAdding(false);
      setNewName("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to add category."));
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (category: Category) => {
    setIsAdding(false);
    setEditingId(category.id);
    setEditingName(category.name);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const submitEdit = async () => {
    const name = editingName.trim();
    if (!name || editingId === null) return;

    setIsSaving(true);
    setError(null);
    try {
      await onUpdate(editingId, name);
      setEditingId(null);
      setEditingName("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update category."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Categories</h2>
        <button
          type="button"
          onClick={startAdd}
          className="flex items-center gap-1 text-sm font-medium text-[#fbbf24] hover:text-[#fbbf24]/80 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-1">
        {isAdding && (
          <div className="flex items-center gap-2 py-1.5">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitAdd()}
              placeholder="New category name"
              className="h-8 flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#fbbf24]/60"
            />
            <button
              type="button"
              disabled={isSaving}
              onClick={submitAdd}
              className="text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={cancelAdd}
              className="text-white/40 hover:text-white/70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {isLoading ? (
          <p className="py-2 text-sm text-white/40">Loading categories...</p>
        ) : categories.length === 0 && !isAdding ? (
          <p className="py-2 text-sm text-white/40">No categories yet.</p>
        ) : (
          categories.map((category) =>
            editingId === category.id ? (
              <div key={category.id} className="flex items-center gap-2 py-1.5">
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitEdit()}
                  className="h-8 flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white outline-none focus:border-[#fbbf24]/60"
                />
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={submitEdit}
                  className="text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-white/40 hover:text-white/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-lg px-1 py-1.5 hover:bg-white/5"
              >
                <span className="text-sm text-white/70">{category.name}</span>
                <button
                  type="button"
                  onClick={() => startEdit(category)}
                  className="text-white/30 hover:text-white"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            ),
          )
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default CategoriesPanel;
