export type AppEnv = {
    Variables: {
        userId: string;
        tenantId: string;
        role: string;
        permissions?: import('../auth/permission.types.js').Permission[];
        jwtPayload?: Record<string, unknown>; // To hold decoded JWT safely
    };
};
