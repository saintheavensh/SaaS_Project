import { EventEmitter } from 'events';

export const productsEmitter = new EventEmitter();

export enum ProductsEvent {
    PRODUCT_CREATED = 'product.created',
    PRODUCT_UPDATED = 'product.updated',
}

export interface ProductEventPayload {
    tenantId: string;
    productId: string;
    name: string;
    metadata?: any;
}
