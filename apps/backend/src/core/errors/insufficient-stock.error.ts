export class InsufficientStockError extends Error {
    constructor(message: string = 'Insufficient stock for this operation.') {
        super(message);
        this.name = 'InsufficientStockError';
    }
}
