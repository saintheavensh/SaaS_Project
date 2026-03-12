import { ProductsRepository } from './repository.js';
import { CreateProductInput, UpdateProductInput } from './schemas/products.schemas.js';
import { productsEmitter, ProductsEvent, ProductEventPayload } from './events/index.js';

/**
 * Service for Products business logic.
 */
export class ProductsService {
    constructor(
        private readonly tenantId: string,
        private readonly repository: ProductsRepository
    ) {}

    /**
     * Get a product by ID
     */
    async getProduct(productId: string) {
        return this.repository.getProductById(productId);
    }

    /**
     * Create a new product
     */
    async createProduct(productData: CreateProductInput) {
        const newProduct = await this.repository.insertProduct(productData);

        // Emit ProductCreated event
        const payload: ProductEventPayload = {
            tenantId: this.tenantId,
            productId: newProduct.id,
            name: newProduct.name,
        };
        productsEmitter.emit(ProductsEvent.PRODUCT_CREATED, payload);

        return newProduct;
    }

    /**
     * Update an existing product
     */
    async updateProduct(productId: string, updateData: UpdateProductInput) {
        const existing = await this.repository.getProductById(productId);
        if (!existing) {
            throw new Error('Product not found');
        }

        const updated = await this.repository.updateProduct(productId, {
            ...updateData,
            updatedAt: new Date(),
        });

        if (updated) {
            const payload: ProductEventPayload = {
                tenantId: this.tenantId,
                productId: updated.id,
                name: updated.name,
            };
            productsEmitter.emit(ProductsEvent.PRODUCT_UPDATED, payload);
        }

        return updated;
    }
}
