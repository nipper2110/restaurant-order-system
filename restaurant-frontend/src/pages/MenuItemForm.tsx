import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import FoodImageUpload from "@/components/menu-items/FoodImageUpload";
import CategoriesPanel from "@/components/menu-items/CategoriesPanel";
import ProductOptionsSection from "@/components/menu-items/ProductOptionsSection";
import { createId, type DraftOptionGroup } from "@/components/menu-items/types";
import { getErrorMessage } from "@/api";
import {
  createCategory,
  createMenuItem,
  createProductOption,
  createProductOptionCategory,
  deleteProductOption,
  deleteProductOptionCategory,
  getCategories,
  getMenuItem,
  updateCategory,
  updateMenuItem,
  updateProductOption,
  updateProductOptionCategory,
} from "@/api/menuItems";
import type { Category } from "@/types";

interface FormErrors {
  name?: string;
  price?: string;
  category?: string;
  image?: string;
}

function MenuItemForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingItem, setIsLoadingItem] = useState(isEditMode);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [optionGroups, setOptionGroups] = useState<DraftOptionGroup[]>([]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getCategories()
      .then((data) => {
        if (isMounted) setCategories(data);
      })
      .catch((err) => {
        if (isMounted)
          setSubmitError(getErrorMessage(err, "Failed to load categories."));
      })
      .finally(() => {
        if (isMounted) setIsLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isEditMode || !id) return;
    let isMounted = true;

    getMenuItem(Number(id))
      .then((item) => {
        if (!isMounted) return;
        setName(item.name);
        setDescription(item.description ?? "");
        setPrice(item.price);
        setCategory(item.category.name);
        setIsAvailable(item.isAvailable);
        setImagePreviewUrl(`${import.meta.env.VITE_IMG_URL}${item.image}`);
        setOptionGroups(
          item.productOptionCategory.map((group) => ({
            id: createId(),
            name: group.name,
            isRequired: group.isRequired,
            isEditing: false,
            persistedId: group.id,
            options: group.options.map((option) => ({
              id: createId(),
              name: option.name,
              additionalPrice: option.additionalPrice,
              isEditing: false,
              persistedId: option.id,
            })),
          })),
        );
      })
      .catch((err) => {
        if (isMounted)
          setSubmitError(getErrorMessage(err, "Failed to load menu item."));
      })
      .finally(() => {
        if (isMounted) setIsLoadingItem(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImagePreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const handleCreateCategory = async (categoryName: string) => {
    const category = await createCategory(categoryName);
    setCategories((prev) => [...prev, category]);
  };

  const handleUpdateCategory = async (id: number, categoryName: string) => {
    await updateCategory(id, categoryName);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: categoryName } : c)),
    );
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setIsAvailable(true);
    setImageFile(null);
    setImagePreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setOptionGroups([]);
    setErrors({});
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!name.trim()) nextErrors.name = "Menu item name is required.";
    if (!price || Number(price) <= 0)
      nextErrors.price = "Enter a valid price.";
    if (!category.trim()) nextErrors.category = "Category is required.";
    if (!imageFile && !imagePreviewUrl)
      nextErrors.image = "Upload a food photo.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    setSubmitError(null);
    setSuccessMessage(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditMode && id) {
        await updateMenuItem({
          menuItemId: Number(id),
          name: name.trim(),
          description: description.trim(),
          price,
          isAvailable,
          category: category.trim(),
          image: imageFile,
        });
      } else {
        await createMenuItem({
          name: name.trim(),
          description: description.trim(),
          price,
          isAvailable,
          category: category.trim(),
          image: imageFile!,
        });
      }

      const validGroups = optionGroups.filter((g) => g.name.trim());
      for (const group of validGroups) {
        // Groups loaded from an existing menu item already exist in the
        // database — only create ones added in this session.
        const groupId =
          group.persistedId ??
          (await createProductOptionCategory(
            group.name.trim(),
            group.isRequired,
            name.trim(),
          ));

        const validOptions = group.options.filter(
          (o) => o.name.trim() && !o.persistedId,
        );
        for (const option of validOptions) {
          await createProductOption(
            option.name.trim(),
            option.additionalPrice ? Number(option.additionalPrice) : undefined,
            groupId,
          );
        }
      }

      if (isEditMode) {
        navigate("/menuItems");
        return;
      }

      setSuccessMessage(`"${name.trim()}" was added to the menu.`);
      resetForm();
      getCategories().then(setCategories).catch(() => {});
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Failed to save the menu item."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingItem) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <p className="text-sm text-white/40">Loading menu item...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="pb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a1a] border border-white/10 text-white/70 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="font-bold text-xl text-[#fbbf24]">
            {isEditMode ? "Edit Menu Item" : "Add Menu Item"}
          </h1>
          <span className="text-sm text-gray-400">
            {isEditMode
              ? "Update the details for this dish."
              : "Fill in the details to add a new dish to your menu."}
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
          {successMessage}
        </div>
      )}
      {submitError && (
        <div className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 w-full">
            <h2 className="text-lg font-semibold text-white pb-4 border-b border-white/10">
              Basic Information
            </h2>

            <div className="mt-5 flex flex-col gap-5">
              <div>
                <label className="text-sm text-white/70">
                  Menu Item Name <span className="text-red-400">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pad Kra Pao Moo"
                  className="mt-1.5 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#fbbf24]/60"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-white/70">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the dish — ingredients, taste, serving style..."
                  rows={3}
                  className="mt-1.5 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#fbbf24]/60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm text-white/70">
                    Price (THB) <span className="text-red-400">*</span>
                  </label>
                  <div className="mt-1.5 flex items-center rounded-lg border border-white/10 bg-white/5 focus-within:border-[#fbbf24]/60">
                    <span className="pl-4 text-sm text-white/40">฿</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="h-11 w-full bg-transparent px-2 text-sm text-white outline-none placeholder:text-white/30"
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-white/70">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    list="menu-item-categories"
                    placeholder="e.g. Main Dishes"
                    className="mt-1.5 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#fbbf24]/60"
                  />
                  <datalist id="menu-item-categories">
                    {categories.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                  {errors.category && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.category}
                    </p>
                  )}
                  {isLoadingCategories && (
                    <p className="mt-1 text-xs text-white/30">
                      Loading categories...
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium text-white">Available</p>
                  <p className="text-xs text-white/40">
                    Customers can see and order this item
                  </p>
                </div>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
                />
              </div>
            </div>
          </div>

          <div>
            <ProductOptionsSection
              groups={optionGroups}
              onChange={setOptionGroups}
              onUpdateGroup={(categoryId, groupName, isRequired) =>
                updateProductOptionCategory(
                  categoryId,
                  groupName,
                  isRequired,
                  name.trim(),
                )
              }
              onDeleteGroup={deleteProductOptionCategory}
              onUpdateOption={updateProductOption}
              onDeleteOption={deleteProductOption}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <FoodImageUpload
            previewUrl={imagePreviewUrl}
            error={errors.image}
            onFileSelect={handleImageSelect}
          />

          <CategoriesPanel
            categories={categories}
            isLoading={isLoadingCategories}
            onCreate={handleCreateCategory}
            onUpdate={handleUpdateCategory}
          />

          <Button
            type="button"
            size="lg"
            disabled={isSubmitting}
            onClick={handleSave}
            className="w-full bg-[#fbbf24] text-black hover:bg-[#fbbf24]/80"
          >
            <Check className="h-4 w-4" />
            {isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Save Changes"
                : "Save Menu Item"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate(-1)}
            className="w-full border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MenuItemForm;
