import { BrandRepository } from './brands.repository.js';
import { CreateBrandInput, UpdateBrandInput, Brand } from './types.js';

/**
 * Service for Brand operations
 */
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository) {}

  /**
   * Get all brands for the current tenant
   */
  async getBrands(): Promise<Brand[]> {
    return this.brandRepository.getBrands();
  }

  /**
   * Get a single brand by ID
   */
  async getBrandById(id: string): Promise<Brand | null> {
    return this.brandRepository.getBrandById(id);
  }

  /**
   * Create a new brand
   */
  async createBrand(data: CreateBrandInput): Promise<Brand> {
    return this.brandRepository.createBrand(data);
  }

  /**
   * Update an existing brand
   */
  async updateBrand(id: string, data: UpdateBrandInput): Promise<Brand | null> {
    return this.brandRepository.updateBrand(id, data);
  }

  /**
   * Delete a brand
   */
  async deleteBrand(id: string): Promise<boolean> {
    return this.brandRepository.deleteBrand(id);
  }
}
