import { PrismaClient } from '@prisma/client';

export abstract class SinglePrisma {
    private static _prisma: PrismaClient | null = null;

    public static get instance() {
        if (!this._prisma) {
            this._prisma = new PrismaClient();
        }
        return this._prisma;
    }

    public static destroyInstance() {
        this._prisma = null;
    }
}
