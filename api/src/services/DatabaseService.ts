import mysql from 'mysql2';
import { catchError, map, Observable, switchMap, throwError } from 'rxjs';
import { DBConfig } from '../config';
import { PrismaClient } from '@prisma/client';

export class DatabaseService {
    private static _instance: DatabaseService | null;

    private _prisma = new PrismaClient();

    private constructor() { }

    public static get instance(): DatabaseService {
        if (!DatabaseService._instance) {
            DatabaseService._instance = new DatabaseService();
        }
        return DatabaseService._instance;
    }

    public static destroyInstance(): void {
        DatabaseService._instance = null;
    }

    public get prisma() {
        return this._prisma;
    }

    public transaction(connection: mysql.PoolConnection) {

    }

    public commit(connection: mysql.PoolConnection) {

    }

    public rollback(connection: mysql.PoolConnection) {

    }

    public query() {
    }
}
