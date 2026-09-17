import { Check, GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createId, type DraftOption, type DraftOptionGroup } from "./types";

interface ProductOptionsSectionProps {
  groups: DraftOptionGroup[];
  onChange: (groups: DraftOptionGroup[]) => void;
}

function ProductOptionsSection({
  groups,
  onChange,
}: ProductOptionsSectionProps) {
  const update = (updater: (groups: DraftOptionGroup[]) => DraftOptionGroup[]) =>
    onChange(updater(groups));

  const patchGroup = (groupId: string, patch: Partial<DraftOptionGroup>) =>
    update((gs) => gs.map((g) => (g.id === groupId ? { ...g, ...patch } : g)));

  const removeGroup = (groupId: string) =>
    update((gs) => gs.filter((g) => g.id !== groupId));

  const addGroup = () =>
    update((gs) => [
      ...gs,
      {
        id: createId(),
        name: "",
        isRequired: false,
        isEditing: true,
        options: [],
      },
    ]);

  const cancelGroup = (groupId: string, currentName: string) => {
    if (!currentName.trim()) removeGroup(groupId);
    else patchGroup(groupId, { isEditing: false });
  };

  const patchOption = (
    groupId: string,
    optionId: string,
    patch: Partial<DraftOption>,
  ) =>
    update((gs) =>
      gs.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: g.options.map((o) =>
                o.id === optionId ? { ...o, ...patch } : o,
              ),
            }
          : g,
      ),
    );

  const removeOption = (groupId: string, optionId: string) =>
    update((gs) =>
      gs.map((g) =>
        g.id === groupId
          ? { ...g, options: g.options.filter((o) => o.id !== optionId) }
          : g,
      ),
    );

  const addOption = (groupId: string) =>
    update((gs) =>
      gs.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: [
                ...g.options,
                {
                  id: createId(),
                  name: "",
                  additionalPrice: "",
                  isEditing: true,
                },
              ],
            }
          : g,
      ),
    );

  const cancelOption = (
    groupId: string,
    optionId: string,
    currentName: string,
  ) => {
    if (!currentName.trim()) removeOption(groupId, optionId);
    else patchOption(groupId, optionId, { isEditing: false });
  };

  return (
    <div className="rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 w-full">
      <div className="flex items-center justify-between pb-5 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">Product Options</h2>
        <Button
          type="button"
          size="sm"
          onClick={addGroup}
          className="bg-[#fbbf24] text-black hover:bg-[#fbbf24]/80"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Option Group
        </Button>
      </div>

      <div className="mt-5 flex flex-col gap-5">
        {groups.length === 0 && (
          <p className="text-sm text-white/40">
            No option groups yet. Add one for choices like size or spice
            level.
          </p>
        )}

        {groups.map((group) => (
          <div
            key={group.id}
            className="overflow-hidden rounded-xl border border-white/10"
          >
            {/* Group header */}
            {group.isEditing ? (
              <div className="flex flex-wrap items-center gap-3 bg-white/5 px-4 py-3">
                <input
                  autoFocus
                  value={group.name}
                  onChange={(e) =>
                    patchGroup(group.id, { name: e.target.value })
                  }
                  placeholder="Group name, e.g. Size"
                  className="h-8 min-w-40 flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#fbbf24]/60"
                />
                <label className="flex items-center gap-1.5 text-xs text-white/60">
                  <input
                    type="checkbox"
                    checked={group.isRequired}
                    onChange={(e) =>
                      patchGroup(group.id, { isRequired: e.target.checked })
                    }
                    className="h-3.5 w-3.5 accent-[#fbbf24]"
                  />
                  Required
                </label>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!group.name.trim()}
                    onClick={() => patchGroup(group.id, { isEditing: false })}
                    className="text-emerald-400 hover:text-emerald-300 disabled:opacity-40"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelGroup(group.id, group.name)}
                    className="text-white/40 hover:text-white/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-white/20" />
                  <span className="text-sm font-medium text-white">
                    {group.name}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      group.isRequired
                        ? "bg-[#fbbf24]/15 text-[#fbbf24]"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {group.isRequired ? "Required" : "Optional"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      patchGroup(group.id, { isEditing: true })
                    }
                    className="text-white/40 hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeGroup(group.id)}
                    className="text-red-400/70 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Options */}
            <div className="flex flex-col divide-y divide-white/5 px-4">
              {group.options.map((option) =>
                option.isEditing ? (
                  <div
                    key={option.id}
                    className="flex flex-wrap items-center gap-2 py-2.5"
                  >
                    <input
                      autoFocus
                      value={option.name}
                      onChange={(e) =>
                        patchOption(group.id, option.id, {
                          name: e.target.value,
                        })
                      }
                      placeholder="Option name"
                      className="h-8 min-w-32 flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#fbbf24]/60"
                    />
                    <div className="flex items-center gap-1 text-sm text-white/40">
                      <span>+฿</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={option.additionalPrice}
                        onChange={(e) =>
                          patchOption(group.id, option.id, {
                            additionalPrice: e.target.value,
                          })
                        }
                        placeholder="0"
                        className="h-8 w-20 rounded-lg border border-white/10 bg-white/5 px-2 text-sm text-white outline-none focus:border-[#fbbf24]/60"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={!option.name.trim()}
                      onClick={() =>
                        patchOption(group.id, option.id, { isEditing: false })
                      }
                      className="text-emerald-400 hover:text-emerald-300 disabled:opacity-40"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        cancelOption(group.id, option.id, option.name)
                      }
                      className="text-white/40 hover:text-white/70"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    key={option.id}
                    className="flex items-center justify-between py-2.5"
                  >
                    <span className="flex items-center gap-2 text-sm text-white/70">
                      <span className="h-1 w-1 rounded-full bg-white/30" />
                      {option.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/40 tabular-nums">
                        {Number(option.additionalPrice) > 0
                          ? `+฿${option.additionalPrice}`
                          : "Included"}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          patchOption(group.id, option.id, {
                            isEditing: true,
                          })
                        }
                        className="text-white/30 hover:text-white"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeOption(group.id, option.id)}
                        className="text-red-400/60 hover:text-red-400"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ),
              )}

              <button
                type="button"
                onClick={() => addOption(group.id)}
                className="flex items-center gap-1 py-2.5 text-sm font-medium text-[#fbbf24] hover:text-[#fbbf24]/80"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Option
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductOptionsSection;
