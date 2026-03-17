import { ProductDeviceCompatibilityRepository } from './product-device-compatibility.repository.js';
import { CreateProductDeviceCompatibilityInput, UpdateProductDeviceCompatibilityInput, ProductDeviceCompatibility } from './product-device-compatibility.types.js';

/**
 * Service for Product-Device Compatibility operations
 */
export class ProductDeviceCompatibilityService {
  constructor(private readonly repository: ProductDeviceCompatibilityRepository) {}

  /**
   * Get all compatibility mappings for the current tenant
   */
  async getCompatibilities(): Promise<ProductDeviceCompatibility[]> {
    return this.repository.findAll();
  }

  /**
   * Get a single compatibility mapping by ID
   */
  async getCompatibilityById(id: string): Promise<ProductDeviceCompatibility | null> {
    return this.repository.findOne(id);
  }

  /**
   * Create a new compatibility mapping with unique validation
   */
  async createCompatibility(data: CreateProductDeviceCompatibilityInput): Promise<ProductDeviceCompatibility> {
    // Unique validation per productId + deviceId
    const existing = await this.repository.findByProductAndDevice(data.productId, data.deviceId);
    if (existing) {
      throw new Error(`Product is already compatible with this device.`);
    }
    return this.repository.create(data);
  }

  /**
   * Update an existing compatibility mapping with unique validation
   */
  async updateCompatibility(id: string, data: UpdateProductDeviceCompatibilityInput): Promise<ProductDeviceCompatibility | null> {
    // If productId or deviceId is being updated, check for conflicts
    if (data.productId || data.deviceId) {
      const current = await this.repository.findOne(id);
      if (!current) return null;

      const productId = data.productId ?? current.productId;
      const deviceId = data.deviceId ?? current.deviceId;

      if (productId !== current.productId || deviceId !== current.deviceId) {
        const existing = await this.repository.findByProductAndDevice(productId, deviceId);
        if (existing && existing.id !== id) {
          throw new Error(`Product is already compatible with this device.`);
        }
      }
    }

    return this.repository.update(id, data);
  }

  /**
   * Delete a compatibility mapping
   */
  async deleteCompatibility(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
