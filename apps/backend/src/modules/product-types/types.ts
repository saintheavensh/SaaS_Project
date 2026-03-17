import { productTypes } from '@my-saas-app/db';

export type ProductType = typeof productTypes.$inferSelect;
export type CreateProductTypeInput = Omit<typeof productTypes.$inferInsert, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>;
export type UpdateProductTypeInput = Partial<CreateProductTypeInput>;
