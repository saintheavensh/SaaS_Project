/**
 * Utility for currency conversion and precision handling.
 * All financial arithmetic must happen in minor units (cents/integers).
 */

/**
 * Converts a decimal string or number to integer minor units (cents).
 * e.g., "19.99" -> 1999, 15 -> 1500
 */
export function decimalToMinorUnit(value: string | number): number {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 0;
    
    // Using round to ensure 19.999999999999 -> 20.00 equivalent
    return Math.round(num * 100);
}

/**
 * Converts integer minor units (cents) back to a decimal string for database/storage.
 * e.g., 1999 -> "19.99"
 */
export function minorUnitToDecimal(cents: number): string {
    return (cents / 100).toFixed(2);
}

/**
 * Safe subtraction between two decimal strings, returning a decimal string.
 * Uses minor units internally for exact precision.
 */
export function safeSubtract(a: string, b: string): string {
    const centsA = decimalToMinorUnit(a);
    const centsB = decimalToMinorUnit(b);
    return minorUnitToDecimal(centsA - centsB);
}
