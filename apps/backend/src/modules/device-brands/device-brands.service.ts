import { DeviceBrandRepository } from './device-brands.repository.js';
import { CreateDeviceBrandInput, UpdateDeviceBrandInput, DeviceBrand } from './types.js';

/**
 * Service for Device Brand operations
 */
export class DeviceBrandService {
  constructor(private readonly deviceBrandRepository: DeviceBrandRepository) {}

  /**
   * Get all device brands for the current tenant
   */
  async getDeviceBrands(): Promise<DeviceBrand[]> {
    return this.deviceBrandRepository.getDeviceBrands();
  }

  /**
   * Get a single device brand by ID
   */
  async getDeviceBrandById(id: string): Promise<DeviceBrand | null> {
    return this.deviceBrandRepository.getDeviceBrandById(id);
  }

  /**
   * Create a new device brand
   */
  async createDeviceBrand(data: CreateDeviceBrandInput): Promise<DeviceBrand> {
    return this.deviceBrandRepository.createDeviceBrand(data);
  }

  /**
   * Update an existing device brand
   */
  async updateDeviceBrand(id: string, data: UpdateDeviceBrandInput): Promise<DeviceBrand | null> {
    return this.deviceBrandRepository.updateDeviceBrand(id, data);
  }

  /**
   * Delete a device brand
   */
  async deleteDeviceBrand(id: string): Promise<boolean> {
    return this.deviceBrandRepository.deleteDeviceBrand(id);
  }
}
