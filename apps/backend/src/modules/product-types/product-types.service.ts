import { ProductTypesRepository } from './product-types.repository.js';
import { CategoryRepository } from '../categories/categories.repository.js';
import { CreateProductTypeInput, UpdateProductTypeInput, ProductType } from './types.js';

/**
 * Service for Product Types operations
 */
export class ProductTypesService {
  constructor(
    private readonly repository: ProductTypesRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  /**
   * Get all product types for the current tenant
   */
  async getProductTypes(): Promise<ProductType[]> {
    return this.repository.findAll();
  }

  /**
   * Get a single product type by ID
   */
  async getProductTypeById(id: string): Promise<ProductType | null> {
    return this.repository.findById(id);
  }

  /**
   * Get all product types for a specific category
   */
  async getProductTypesByCategory(categoryId: string): Promise<ProductType[]> {
    return this.repository.findByCategory(categoryId);
  }

  /**
   * Create a new product type with validation
   */
  async createProductType(data: CreateProductTypeInput): Promise<ProductType> {
    // 1. Validate category exists in same tenant
    const category = await this.categoryRepository.getCategoryById(data.categoryId);
    if (!category) {
      throw new Error(`Category with ID "${data.categoryId}" not found.`);
    }

    // 2. Validate unique name per category
    const existing = await this.repository.findByNameAndCategory(data.name, data.categoryId);
    if (existing) {
      throw new Error(`Product type "${data.name}" already exists in this category.`);
    }

    return this.repository.create(data);
  }

  /**
   * Update an existing product type with validation
   */
  async updateProductType(id: string, data: UpdateProductTypeInput): Promise<ProductType | null> {
    const current = await this.repository.findById(id);
    if (!current) return null;

    const name = data.name ?? current.name;
    const categoryId = data.categoryId ?? current.categoryId;

    // If name or categoryId is changing, validate uniqueness
    if (name !== current.name || categoryId !== current.categoryId) {
      // If categoryId is changing, validate it exists
      if (categoryId !== current.categoryId) {
        const category = await this.categoryRepository.getCategoryById(categoryId);
        if (!category) {
          throw new Error(`Category with ID "${categoryId}" not found.`);
        }
      }

      const existing = await this.repository.findByNameAndCategory(name, categoryId);
      if (existing && existing.id !== id) {
        throw new Error(`Product type "${name}" already exists in this category.`);
      }
    }

    return this.repository.update(id, data);
  }

  /**
   * Delete a product type
   */
  async deleteProductType(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
