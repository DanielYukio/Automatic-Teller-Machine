import { DatabaseService } from '../services';
import { IUnity, IFilter, ICrud, IClient } from '../interfaces';
import { map, Observable, switchMap } from 'rxjs';

export class UnityProvider implements ICrud<IUnity> {
    private static _instance: UnityProvider | null;

    private database = DatabaseService.instance;

    private constructor() { }

    public static get instance(): UnityProvider {
        if (!UnityProvider._instance) {
            UnityProvider._instance = new UnityProvider();
        }
        return UnityProvider._instance;
    }

    public static destroyInstance(): void {
        UnityProvider._instance = null;
    }

    private proccessResult(result: any[]): IUnity[] {

        return result.map((row) => {
            const client: IClient = {
                CLI_ID: row.CLI_ID,
                CLI_DESCRIPTION: row.CLI_DESCRIPTION,
                CLI_STATUS: row.CLI_STATUS,
                CLI_CNPJ: row.CLI_CNPJ,
                CLI_NOTES: row.CLI_NOTES,
                CLI_DT_CREATE: row.CLI_DT_CREATE,
                CLI_DT_UPDATE: row.CLI_DT_UPDATE
            };

            const propNames = Object.getOwnPropertyNames(client);
            for (const pName of propNames) {
                delete row[`${pName}`];
            }

            return {
                ...row,
                CLIENT: client
            };
        });
    }

    public insert(object: IUnity): Observable<any> {
        const sql = `INSERT INTO UNITY(UNI_DESCRIPTION, UNI_CNPJ, UNI_STATUS, UNI_CODE, UNI_NOTES, UNI_CLI_ID, UNI_DEVICE_CODE, UNI_DT_CREATE, UNI_DT_UPDATE)
                    VALUE (?,?,?,?,?,?,?,?,?)`;

        const datetime = new Date();

        const values = [
            object.UNI_DESCRIPTION,
            object.UNI_CNPJ,
            object.UNI_STATUS,
            object.UNI_CODE,
            object.UNI_NOTES,
            object.UNI_CLI_ID,
            object.UNI_DEVICE_CODE,
            datetime, datetime
        ];

        return this.database.query(sql, values);
    }

    public readByID(id: string): Observable<IUnity[]> {
        const sql = `SELECT * FROM UNITY INNER JOIN CLIENT ON CLI_ID = UNI_CLI_ID WHERE UNI_ID = ?`;

        const values = [id];

        return this.database.query(sql, values).pipe(
            map((result: any[]) => this.proccessResult(result))
        );
    }

    public readAll(): Observable<IUnity[]> {
        const sql = `SELECT * FROM UNITY INNER JOIN CLIENT ON CLI_ID = UNI_CLI_ID`;

        return this.database.query(sql).pipe(
            map((result) => {
                return this.proccessResult(result);
            })
        );
    }

    public filterData(filter: IFilter): Observable<{ list: IUnity[]; count: number; }> {
        let sql = `SELECT COUNT(*) AS COUNT FROM UNITY
                    WHERE UNI_ID LIKE ?
                        OR UNI_DESCRIPTION LIKE ?
                        OR UNI_CNPJ LIKE ?
                        OR UNI_CODE LIKE ?
                        OR UNI_CLI_ID LIKE ?
                        OR UNI_DEVICE_CODE LIKE ?`;

        const search = filter.search ? filter.search : '';
        let values: any[] = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];

        return this.database.query(sql, values).pipe(
            switchMap((rawCount) => {
                sql = `SELECT * FROM UNITY
                        INNER JOIN CLIENT ON CLI_ID = UNI_CLI_ID
                        WHERE UNI_ID LIKE ?
                            OR UNI_DESCRIPTION LIKE ?
                            OR UNI_CNPJ LIKE ?
                            OR UNI_CODE LIKE ?
                            OR UNI_CLI_ID LIKE ?
                            OR UNI_DEVICE_CODE LIKE ?
                        ORDER BY ${filter.columnSort || 'UNI_ID'} ${filter.sort || 'ASC'}
                        LIMIT ?, ?`;

                values = [
                    `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`,
                    filter.page, filter.pageSize
                ];

                return this.database.query(sql, values).pipe(
                    map((rows) => {
                        return {
                            list: this.proccessResult(rows), count: rawCount[0].COUNT
                        };
                    })
                );
            })
        );
    }

    public filterByClient(filter: IFilter, CLI_ID: string): Observable<{ list: IUnity[]; count: number; }> {
        let sql = `SELECT COUNT(*) AS COUNT FROM UNITY
                    WHERE UNI_DESCRIPTION LIKE ?
                        AND UNI_CLI_ID = ?`;

        const search = filter.search ? filter.search : '';
        let values: any[] = [
            `%${search}%`, CLI_ID,
        ];

        return this.database.query(sql, values).pipe(
            switchMap((rawCount) => {
                sql = `SELECT * FROM UNITY
                        INNER JOIN CLIENT ON CLI_ID = UNI_CLI_ID
                        WHERE UNI_DESCRIPTION LIKE ?
                            AND UNI_CLI_ID = ?
                        ORDER BY UNI_DESCRIPTION ASC
                        LIMIT ?, ?`;

                values = [
                    `%${search}%`, CLI_ID,
                    filter.page, filter.pageSize
                ];

                return this.database.query(sql, values).pipe(
                    map((rows) => {
                        return {
                            list: this.proccessResult(rows), count: rawCount[0].COUNT
                        };
                    })
                );
            })
        );
    }

    public update(object: IUnity): Observable<any> {
        const sql = ` UPDATE UNITY
                        SET UNI_DESCRIPTION = ?,
                            UNI_CNPJ = ?,
                            UNI_STATUS = ?,
                            UNI_CODE = ?,
                            UNI_NOTES = ?,
                            UNI_CLI_ID = ?,
                            UNI_DEVICE_CODE = ?,
                            UNI_DT_UPDATE = ?
                        WHERE UNI_ID = ?`;

        const values = [
            object.UNI_DESCRIPTION,
            object.UNI_CNPJ,
            object.UNI_STATUS,
            object.UNI_CODE,
            object.UNI_NOTES,
            object.UNI_CLI_ID,
            object.UNI_DEVICE_CODE,
            new Date(),
            object.UNI_ID,
        ];

        return this.database.query(sql, values);
    }

    public delete(id: string): Observable<any> {
        const sql = `DELETE FROM UNITY WHERE UNI_ID = ?`;
        return this.database.query(sql, id);
    }
}
