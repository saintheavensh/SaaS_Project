/**
 * Core Device Brand interface
 */
export interface DeviceBrand {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a new device brand
 */
export interface CreateDeviceBrandInput {
  name: string;
}

/**
 * Input for updating an existing device brand
 */
export type UpdateDeviceBrandInput = Partial<CreateDeviceBrandInput>;
