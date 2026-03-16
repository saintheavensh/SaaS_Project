import { devices } from '@my-saas-app/db';

export type Device = typeof devices.$inferSelect;
export type CreateDeviceInput = typeof devices.$inferInsert;
export type UpdateDeviceInput = Partial<Omit<CreateDeviceInput, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>;
