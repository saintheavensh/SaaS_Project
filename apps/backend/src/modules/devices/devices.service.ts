import { DevicesRepository } from './devices.repository.js';
import { CreateDeviceInput, UpdateDeviceInput, Device } from './types.js';

/**
 * Service for Device operations
 */
export class DevicesService {
  constructor(private readonly repository: DevicesRepository) {}

  /**
   * Get all devices for the current tenant
   */
  async getDevices(): Promise<Device[]> {
    return this.repository.findAll();
  }

  /**
   * Get a single device by ID
   */
  async getDeviceById(id: string): Promise<Device | null> {
    return this.repository.findOne(id);
  }

  /**
   * Create a new device with unique validation
   */
  async createDevice(data: CreateDeviceInput): Promise<Device> {
    // Unique validation per brandId + model
    const existing = await this.repository.findByBrandAndModel(data.brandId, data.model);
    if (existing) {
      throw new Error(`Device with model "${data.model}" already exists for this brand.`);
    }
    return this.repository.create(data);
  }

  /**
   * Update an existing device with unique validation
   */
  async updateDevice(id: string, data: UpdateDeviceInput): Promise<Device | null> {
    // If brandId or model is being updated, check for conflicts
    if (data.brandId || data.model) {
      const current = await this.repository.findOne(id);
      if (!current) return null;

      const brandId = data.brandId ?? current.brandId;
      const model = data.model ?? current.model;

      if (brandId !== current.brandId || model !== current.model) {
        const existing = await this.repository.findByBrandAndModel(brandId, model);
        if (existing && existing.id !== id) {
          throw new Error(`Device with model "${model}" already exists for this brand.`);
        }
      }
    }

    return this.repository.update(id, data);
  }

  /**
   * Delete a device
   */
  async deleteDevice(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
