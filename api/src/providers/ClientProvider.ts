import { SinglePrisma } from '../utils';
import { IClient, IFilter, ICrud } from '../interfaces';
import { from, map, Observable, of, switchMap } from 'rxjs';

export class ClientProvider {
    private static _instance: ClientProvider | null;

    private prisma = SinglePrisma.instance;

    private constructor() { }

    public static get instance(): ClientProvider {
        if (!ClientProvider._instance) {
            ClientProvider._instance = new ClientProvider();
        }

        return ClientProvider._instance;
    }

    public static destroyInstance(): void {
        ClientProvider._instance = null;
    }

    public insert(object: IClient) {
        return from(this.prisma.client.create({
            data: object,
        }))
    }

    // public readByID(id: string): Observable<IClient[]> {
    //     const sql = `SELECT * FROM CLIENT WHERE CLI_ID = ?`;
    //     const values = [id];
    //     return this.database.query(sql, values);
    // }


    // public readAll(): Observable<IClient[]> {
    //     const sql = `SELECT * FROM CLIENT`;
    //     return this.database.query(sql);
    // }

    // public filterData(filter: IFilter): Observable<{ list: IClient[]; count: number; }> {
    //     let sql = `SELECT COUNT(*) AS COUNT FROM CLIENT
    //                 WHERE CLI_ID LIKE ?
    //                 OR CLI_DESCRIPTION LIKE ?
    //                 OR CLI_CNPJ LIKE ?`;

    //     const search = filter.search ? filter.search : '';
    //     let values: any[] = [`%${search}%`, `%${search}%`, `%${search}%`];

    //     return this.database.query(sql, values).pipe(
    //         switchMap((rawCount) => {
    //             sql = `SELECT * FROM CLIENT
    //                     WHERE CLI_ID LIKE ? OR CLI_DESCRIPTION LIKE ? OR CLI_CNPJ LIKE ?
    //                     ORDER BY ${filter.columnSort || 'CLI_ID'} ${filter.sort || 'ASC'}
    //                     LIMIT ?, ?`;

    //             values = [
    //                 `%${search}%`, `%${search}%`, `%${search}%`,
    //                 filter.page, filter.pageSize
    //             ];

    //             return this.database.query(sql, values).pipe(
    //                 map((rows) => {
    //                     return {
    //                         list: rows, count: rawCount[0].COUNT
    //                     };
    //                 })
    //             );
    //         })
    //     );
    // }

    // public update(object: IClient): Observable<any> {
    //     const sql = `UPDATE CLIENT
    //                     SET CLI_DESCRIPTION = ?,
    //                         CLI_CNPJ = ?,
    //                         CLI_STATUS = ?,
    //                         CLI_NOTES = ?,
    //                         CLI_DT_UPDATE = ?
    //                     WHERE CLI_ID = ?`;
    //     const values = [
    //         object.CLI_DESCRIPTION,
    //         object.CLI_CNPJ,
    //         object.CLI_STATUS,
    //         object.CLI_NOTES,
    //         new Date(),
    //         object.CLI_ID,
    //     ];

    //     return this.database.query(sql, values);
    // }

    // public delete(id: string): Observable<any> {
    //     const sql = `DELETE FROM CLIENT WHERE CLI_ID = ?`;
    //     return this.database.query(sql, id);
    // }

}
