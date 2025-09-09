import { PrismaClient } from "@prisma/client";
export declare const getTestPrisma: () => PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare const setupTestDatabase: () => Promise<void>;
export declare const teardownTestDatabase: () => Promise<void>;
export declare const createTestWatchlist: (data?: any) => Promise<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const createTestEvent: (data?: any) => Promise<{
    id: string;
    createdAt: Date;
    severity: import("@prisma/client").$Enums.Severity;
    title: string;
    description: string;
}>;
export declare const createTestWatchlistTerm: (watchlistId: string, data?: any) => Promise<{
    id: string;
    term: string;
    watchlistId: string;
}>;
//# sourceMappingURL=database.d.ts.map