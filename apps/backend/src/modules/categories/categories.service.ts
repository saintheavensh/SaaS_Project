import { CategoryRepository } from './categories.repository.js';
import { CreateCategoryInput, UpdateCategoryInput, Category } from './types.js';

/**
 * Service for Category operations
 */
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  /**
   * Get all categories for the current tenant
   */
  async getCategories(): Promise<Category[]> {
    return this.categoryRepository.getCategories();
  }

  /**
   * Get a single category by ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    return this.categoryRepository.getCategoryById(id);
  }

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryInput): Promise<Category> {
    return this.categoryRepository.createCategory(data);
  }

  /**
   * Update an existing category
   */
  async updateCategory(id: string, data: UpdateCategoryInput): Promise<Category | null> {
    return this.categoryRepository.updateCategory(id, data);
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<boolean> {
    return this.categoryRepository.deleteCategory(id);
  }
}
