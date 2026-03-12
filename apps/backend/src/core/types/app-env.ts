export type AppEnv = {
    Variables: {
        userId: string;
        tenantId: string;
        role: string;
        permissions?: string[];
        jwtPayload?: Record<string, unknown>; // To hold decoded JWT safely
    };
};
