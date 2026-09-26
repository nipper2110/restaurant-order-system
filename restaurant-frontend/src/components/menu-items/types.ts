export interface DraftOption {
  id: string;
  name: string;
  additionalPrice: string;
  isEditing: boolean;
  // Set when this option already exists in the database (loaded from the
  // menu item being edited), as opposed to a new one staged for creation.
  persistedId?: number;
}

export interface DraftOptionGroup {
  id: string;
  name: string;
  isRequired: boolean;
  isEditing: boolean;
  options: DraftOption[];
  persistedId?: number;
}

export const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
