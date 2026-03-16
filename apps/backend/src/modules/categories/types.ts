/**
 * Core Category interface
 */
export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a new category
 */
export interface CreateCategoryInput {
  name: string;
  description?: string;
}

/**
 * Input for updating an existing category
 */
export type UpdateCategoryInput = Partial<CreateCategoryInput>;
