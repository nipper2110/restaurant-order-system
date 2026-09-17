import api from "@/api/index";
import type { Category } from "@/types";

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
