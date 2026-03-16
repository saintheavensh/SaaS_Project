import { SupplierRepository } from './suppliers.repository.js';
import { CreateSupplierInput, UpdateSupplierInput, Supplier } from './types.js';

/**
 * Service for Supplier operations
 */
export class SupplierService {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  /**
   * Get all suppliers for the current tenant
   */
  async getSuppliers(): Promise<Supplier[]> {
    return this.supplierRepository.getSuppliers();
  }

  /**
   * Get a single supplier by ID
   */
  async getSupplierById(id: string): Promise<Supplier | null> {
    return this.supplierRepository.getSupplierById(id);
  }

  /**
   * Create a new supplier
   */
  async createSupplier(data: CreateSupplierInput): Promise<Supplier> {
    return this.supplierRepository.createSupplier(data);
  }

  /**
   * Update an existing supplier
   */
  async updateSupplier(id: string, data: UpdateSupplierInput): Promise<Supplier | null> {
    return this.supplierRepository.updateSupplier(id, data);
  }

  /**
   * Delete a supplier
   */
  async deleteSupplier(id: string): Promise<boolean> {
    return this.supplierRepository.deleteSupplier(id);
  }
}
