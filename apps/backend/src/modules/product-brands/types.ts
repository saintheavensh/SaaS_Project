/**
 * Core Brand interface
 */
export interface Brand {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a new brand
 */
export interface CreateBrandInput {
  name: string;
  description?: string;
}

/**
 * Input for updating an existing brand
 */
export type UpdateBrandInput = Partial<CreateBrandInput>;
