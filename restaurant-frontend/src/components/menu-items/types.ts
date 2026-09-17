export interface DraftOption {
  id: string;
  name: string;
  additionalPrice: string;
  isEditing: boolean;
}

export interface DraftOptionGroup {
  id: string;
  name: string;
  isRequired: boolean;
  isEditing: boolean;
  options: DraftOption[];
}

export const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
