/**
 * Core Supplier interface
 */
export interface Supplier {
  id: string;
  name: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a new supplier
 */
export interface CreateSupplierInput {
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
}

/**
 * Input for updating an existing supplier
 */
export type UpdateSupplierInput = Partial<CreateSupplierInput>;
