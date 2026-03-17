import { productDeviceCompatibility } from '@my-saas-app/db';

export type ProductDeviceCompatibility = typeof productDeviceCompatibility.$inferSelect;
export type CreateProductDeviceCompatibilityInput = Omit<typeof productDeviceCompatibility.$inferInsert, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>;
export type UpdateProductDeviceCompatibilityInput = Partial<CreateProductDeviceCompatibilityInput>;
