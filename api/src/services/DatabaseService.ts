import mysql from 'mysql2';
import { catchError, map, Observable, switchMap, throwError } from 'rxjs';
import { DBConfig } from '../config';

export class DatabaseService {
    private static _instance: DatabaseService | null;

    private _pool = mysql.createPool({
        host: DBConfig.DB_HOST,
        user: DBConfig.DB_USER,
        password: DBConfig.DB_PASSWORD,
        database: DBConfig.DB_NAME,
        port: DBConfig.DB_PORT,
        connectionLimit: 1000,
    });

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

    public get connection(): Observable<mysql.PoolConnection> {
        return new Observable<mysql.PoolConnection>((obs) => {
            this._pool.getConnection((error, connection) => {
                if (error) {
                    return obs.error(error);
                }

                obs.next(connection);
                return obs.complete();
            });
        });
    }

    public transaction(connection: mysql.PoolConnection): Observable<void> {
        return new Observable<void>((obs) => {
            connection.beginTransaction((error) => {
                if (error) {
                    return obs.error(error);
                }

                obs.next();
                return obs.complete();
            });
        });
    }

    public commit(connection: mysql.PoolConnection): Observable<void> {
        return new Observable<void>((obs) => {
            connection.commit((error) => {
                if (error) {
                    connection.release();
                    return obs.error(error);
                }
                connection.release();

                obs.next();
                return obs.complete();
            });
        });
    }

    public rollback(connection: mysql.PoolConnection): Observable<void> {
        return new Observable<void>((obs) => {
            connection.rollback(() => {
                connection.release();

                obs.next();
                return obs.complete();
            });
        });
    }

    public query(sql: string, values?: any): Observable<any> {
        return this.connection.pipe(
            switchMap((connection) => this.transaction(connection).pipe(
                switchMap(() => {
                    return new Observable<any>((obs) => {
                        connection.query(sql, values, (error, result) => {
                            if (error) {
                                return obs.error(error);
                            }

                            obs.next(result);
                            return obs.complete();
                        });
                    });
                }),
                switchMap((result) => this.commit(connection).pipe(
                    map(() => result)
                )),
                catchError((error) => this.rollback(connection).pipe(
                    switchMap(() => throwError(() => error))
                ))
            )),
        );
    }
}
