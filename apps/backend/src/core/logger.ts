/**
 * Simple structured logger utility.
 * Outputs JSON strings for easy parsing by log aggregators.
 */
export const logger = {
    info: (event: string, payload?: Record<string, unknown>) => {
        console.log(JSON.stringify({
            level: 'INFO',
            event,
            timestamp: new Date().toISOString(),
            payload
        }));
    },

    warn: (event: string, payload?: Record<string, unknown>) => {
        console.warn(JSON.stringify({
            level: 'WARN',
            event,
            timestamp: new Date().toISOString(),
            payload
        }));
    },

    error: (event: string, payload?: Record<string, unknown>) => {
        console.error(JSON.stringify({
            level: 'ERROR',
            event,
            timestamp: new Date().toISOString(),
            payload
        }));
    }
};
