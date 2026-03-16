import { devices } from '@my-saas-app/db';

export type Device = typeof devices.$inferSelect;
export type CreateDeviceInput = Omit<typeof devices.$inferInsert, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>;
export type UpdateDeviceInput = Partial<CreateDeviceInput>;
