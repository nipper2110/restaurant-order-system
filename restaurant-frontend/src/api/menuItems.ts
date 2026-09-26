import api from "@/api/index";
import type { Category, MenuItem, MenuItemDetail } from "@/types";

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await api.get("/admins/categories");
  return data.category;
};

export const createCategory = async (name: string): Promise<Category> => {
  const { data } = await api.post("/admins/categories", { name });
  return { id: data.categoryId, name };
};

export const updateCategory = async (categoryId: number, name: string) => {
  await api.patch("/admins/categories", { categoryId, name });
};

export interface CreateMenuItemPayload {
  name: string;
  description: string;
  price: string;
  isAvailable: boolean;
  category: string;
  image: File;
}

export const createMenuItem = async (
  payload: CreateMenuItemPayload,
): Promise<number> => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("description", payload.description);
  formData.append("price", payload.price);
  formData.append("isAvailable", String(payload.isAvailable));
  formData.append("category", payload.category);
  formData.append("image", payload.image);

  // Let the browser set the multipart boundary; the instance's default
  // JSON content-type header would otherwise make axios stringify the body.
  const { data } = await api.post("/admins/menu-items", formData, {
    headers: { "Content-Type": undefined },
  });
  return data.menuItemId;
};

export const getMenuItems = async (limit = 100): Promise<MenuItem[]> => {
  const { data } = await api.get("/admins/menu-items", { params: { limit } });
  return data.menuItems;
};

export const getMenuItem = async (id: number): Promise<MenuItemDetail> => {
  const { data } = await api.get(`/admins/menu-items/${id}`);
  return data.menuItem;
};

export interface UpdateMenuItemPayload {
  menuItemId: number;
  name: string;
  description: string;
  price: string;
  isAvailable: boolean;
  category: string;
  image?: File | null;
}

export const updateMenuItem = async (
  payload: UpdateMenuItemPayload,
): Promise<number> => {
  if (payload.image) {
    const formData = new FormData();
    formData.append("menuItemId", String(payload.menuItemId));
    formData.append("name", payload.name);
    formData.append("description", payload.description);
    formData.append("price", payload.price);
    formData.append("isAvailable", String(payload.isAvailable));
    formData.append("category", payload.category);
    formData.append("image", payload.image);

    const { data } = await api.patch("/admins/menu-items", formData, {
      headers: { "Content-Type": undefined },
    });
    return data.menuItemId;
  }

  const { data } = await api.patch("/admins/menu-items", {
    menuItemId: payload.menuItemId,
    name: payload.name,
    description: payload.description,
    price: payload.price,
    isAvailable: payload.isAvailable,
    category: payload.category,
  });
  return data.menuItemId;
};

export const deleteMenuItem = async (menuItemId: number): Promise<void> => {
  await api.delete("/admins/menu-items", { data: { menuItemId } });
};

export const createProductOptionCategory = async (
  name: string,
  isRequired: boolean,
  menuItem: string,
): Promise<number> => {
  const { data } = await api.post("/admins/product-option-categories", {
    name,
    isRequired,
    menuItem,
  });
  return data.categoryId;
};

export const createProductOption = async (
  name: string,
  additionalPrice: number | undefined,
  productOptionCategoryId: number,
): Promise<number> => {
  const { data } = await api.post("/admins/product-options", {
    name,
    additionalPrice,
    productOptionCategoryId,
  });
  return data.productOptionId;
};

export const updateProductOptionCategory = async (
  categoryId: number,
  name: string,
  isRequired: boolean,
  menuItem: string,
) => {
  await api.patch("/admins/product-option-categories", {
    categoryId,
    name,
    isRequired,
    menuItem,
  });
};

export const deleteProductOptionCategory = async (categoryId: number) => {
  await api.delete("/admins/product-option-categories", {
    data: { categoryId },
  });
};

export const updateProductOption = async (
  productOptionId: number,
  name: string,
  additionalPrice: number | undefined,
  productOptionCategoryId: number,
) => {
  await api.patch("/admins/product-options", {
    productOptionId,
    name,
    additionalPrice,
    productOptionCategoryId,
  });
};

export const deleteProductOption = async (productOptionId: number) => {
  await api.delete("/admins/product-options", {
    data: { productOptionId },
  });
};
