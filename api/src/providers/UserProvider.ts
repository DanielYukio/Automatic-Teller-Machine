// import { map, Observable, switchMap } from 'rxjs';
// import { DatabaseService } from '../services';
// import { ICrud, IFilter, IUser, IClient, IUnity } from '../interfaces';

// export class UserProvider implements ICrud<IUser> {
//     private static _instance: UserProvider | null;

//     private database = DatabaseService.instance;

//     private constructor() { }

//     public static get instance(): UserProvider {
//         if (!UserProvider._instance) {
//             UserProvider._instance = new UserProvider();
//         }
//         return UserProvider._instance;
//     }

//     public static destroyInstance(): void {
//         UserProvider._instance = null;
//     }

//     private proccessResult(result: any[], showProfile?: boolean, showPassword?: boolean, showResetPassData?: boolean): IUser[] {
//         return result.map((row) => {
//             let company: IClient | IUnity | undefined;

//             if (row.USR_PRIVILEGE === 'C') {
//                 company = {
//                     CLI_ID: row.CLI_ID,
//                     CLI_DESCRIPTION: row.CLI_DESCRIPTION,
//                     CLI_STATUS: row.CLI_STATUS,
//                     CLI_CNPJ: row.CLI_CNPJ,
//                     CLI_NOTES: row.CLI_NOTES,
//                     CLI_DT_CREATE: row.CLI_DT_CREATE,
//                     CLI_DT_UPDATE: row.CLI_DT_UPDATE
//                 };

//             } else if (row.USR_PRIVILEGE === 'U') {
//                 company = {
//                     UNI_ID: row.UNI_ID,
//                     UNI_DESCRIPTION: row.UNI_DESCRIPTION,
//                     UNI_CNPJ: row.UNI_CNPJ,
//                     UNI_STATUS: row.UNI_STATUS,
//                     UNI_CODE: row.UNI_CODE,
//                     UNI_NOTES: row.UNI_NOTES,
//                     UNI_CLI_ID: row.UNI_CLI_ID,
//                     UNI_DEVICE_CODE: row.UNI_DEVICE_CODE,
//                     UNI_DT_CREATE: row.UNI_DT_CREATE,
//                     UNI_DT_UPDATE: row.UNI_DT_UPDATE
//                 };
//             }

//             const propNames = [
//                 'CLI_ID', 'CLI_DESCRIPTION', 'CLI_STATUS', 'CLI_CNPJ', 'CLI_NOTES', 'CLI_DT_CREATE', 'CLI_DT_UPDATE',
//                 'UNI_ID', 'UNI_DESCRIPTION', 'UNI_CNPJ', 'UNI_STATUS', 'UNI_CODE', 'UNI_NOTES', 'UNI_CLI_ID',
//                 'UNI_DEVICE_CODE', 'UNI_DT_CREATE', 'UNI_DT_UPDATE'
//             ];

//             propNames.forEach((pName) => delete row[pName]);

//             if (!showPassword) {
//                 delete row['USR_PASSWORD'];
//             }
//             if (!showProfile) {
//                 delete row['USR_PROFILE'];
//             }
//             if (!showResetPassData) {
//                 delete row['ISRESETPASS'];
//                 delete row['RESETPASSCODE'];
//                 delete row['DT_RESETPASSLIMIT'];
//             }

//             return {
//                 ...row,
//                 COMPANY: company
//             };
//         });
//     }

//     insert(object: IUser): Observable<any> {
//         const sql = `INSERT INTO USER(USR_NAME, USR_EMAIL, USR_PASSWORD, USR_STATUS, USR_NOTES, USR_DT_CREATE, USR_DT_UPDATE, USR_PRIVILEGE, USR_COMPANY_ID)
//                     VALUE (?,?,?,?,?,?,?,?,?)`;

//         const datetime = new Date();

//         const values = [
//             object.USR_NAME,
//             object.USR_EMAIL,
//             object.USR_PASSWORD,
//             object.USR_STATUS,
//             object.USR_NOTES,
//             datetime, datetime,
//             object.USR_PRIVILEGE,
//             object.USR_COMPANY_ID
//         ];

//         return this.database.query(sql, values);
//     }

//     readByID(id: string, showProfile?: boolean, showResetPassData?: boolean): Observable<IUser[]> {
//         const sql = `SELECT * FROM USER
//                     LEFT JOIN CLIENT ON CLI_ID = USR_COMPANY_ID AND USR_PRIVILEGE = 'C'
//                     LEFT JOIN UNITY ON UNI_ID = USR_COMPANY_ID AND USR_PRIVILEGE = 'U'
//                     WHERE USR_ID = ?`;

//         const values = [id];

//         return this.database.query(sql, values).pipe(
//             map((result: any[]) => {
//                 return this.proccessResult(result, showProfile, false, showResetPassData);
//             })
//         );
//     }

//     readAll(): Observable<IUser[]> {
//         const sql = `SELECT * FROM USER
//                     LEFT JOIN CLIENT ON CLI_ID = USR_COMPANY_ID AND USR_PRIVILEGE = 'C'
//                     LEFT JOIN UNITY ON UNI_ID = USR_COMPANY_ID AND USR_PRIVILEGE = 'U'`;

//         return this.database.query(sql).pipe(
//             map((result) => {
//                 return this.proccessResult(result, false);
//             })
//         );
//     }

//     filterData(filter: IFilter): Observable<{ list: IUser[]; count: number; }> {
//         let sql = `SELECT COUNT(*) AS COUNT FROM USER
//                     WHERE USR_ID LIKE ?
//                         OR USR_NAME LIKE ?
//                         OR USR_EMAIL LIKE ?
//                         OR USR_PRIVILEGE LIKE ?
//                         OR USR_COMPANY_ID LIKE ?`;

//         const search = filter.search ? filter.search : '';
//         let values: any[] = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];

//         return this.database.query(sql, values).pipe(
//             switchMap((rawCount) => {
//                 sql = `SELECT * FROM USER
//                         LEFT JOIN CLIENT ON CLI_ID = USR_COMPANY_ID AND USR_PRIVILEGE = 'C'
//                         LEFT JOIN UNITY ON UNI_ID = USR_COMPANY_ID AND USR_PRIVILEGE = 'U'
//                         WHERE USR_ID LIKE ?
//                             OR USR_NAME LIKE ?
//                             OR USR_EMAIL LIKE ?
//                             OR USR_PRIVILEGE LIKE ?
//                             OR USR_COMPANY_ID LIKE ?
//                         ORDER BY ${filter.columnSort || 'USR_ID'} ${filter.sort || 'ASC'}
//                         LIMIT ?, ?`;

//                 values = [
//                     `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`,
//                     filter.page, filter.pageSize
//                 ];

//                 return this.database.query(sql, values).pipe(
//                     map((rows) => {
//                         return {
//                             list: this.proccessResult(rows, false), count: rawCount[0].COUNT
//                         };
//                     })
//                 );
//             })
//         );
//     }

//     update(object: IUser): Observable<any> {
//         const sql = !object.USR_PROFILE
//             ? `UPDATE USER
//                 SET USR_NAME = ?,
//                     USR_EMAIL = ?,
//                     USR_STATUS = ?,
//                     USR_NOTES = ?,
//                     USR_PRIVILEGE = ?,
//                     USR_COMPANY_ID = ?,
//                     USR_DT_UPDATE = ?
//                 WHERE USR_ID = ?`
//             : `UPDATE USER
//                 SET USR_NAME = ?,
//                     USR_EMAIL = ?,
//                     USR_PROFILE = ?,
//                     USR_STATUS = ?,
//                     USR_NOTES = ?,
//                     USR_PRIVILEGE = ?,
//                     USR_COMPANY_ID = ?,
//                     USR_DT_UPDATE = ?
//                 WHERE USR_ID = ?`;

//         const values = !object.USR_PROFILE
//             ? [
//                 object.USR_NAME,
//                 object.USR_EMAIL,
//                 object.USR_STATUS,
//                 object.USR_NOTES,
//                 object.USR_PRIVILEGE,
//                 object.USR_COMPANY_ID,
//                 new Date(),
//                 object.USR_ID
//             ]
//             : [
//                 object.USR_NAME,
//                 object.USR_EMAIL,
//                 object.USR_PROFILE,
//                 object.USR_STATUS,
//                 object.USR_NOTES,
//                 object.USR_PRIVILEGE,
//                 object.USR_COMPANY_ID,
//                 new Date(),
//                 object.USR_ID
//             ];

//         return this.database.query(sql, values);
//     }

//     updatePartial(object: any): Observable<any> {
//         const sql = `UPDATE USER
//                         SET USR_NAME = ?, USR_PROFILE = ?, USR_EMAIL = ?, USR_DT_UPDATE = ?
//                         WHERE USR_ID = ?`;

//         const values = [
//             object.USR_NAME,
//             object.USR_PROFILE,
//             object.USR_EMAIL,
//             new Date(),
//             object.USR_ID
//         ];

//         return this.database.query(sql, values);
//     }

//     delete(id: string): Observable<any> {
//         const sql = `DELETE FROM USER WHERE USR_ID = ?`;

//         return this.database.query(sql, id);
//     }

//     readByEmail(email: string, showPassword?: boolean, showResetPassData?: boolean): Observable<IUser[]> {
//         const sql = `SELECT * FROM USER WHERE USR_EMAIL = ?`;
//         const values: any[] = [email];

//         return this.database.query(sql, values).pipe(
//             map((result: any[]) => {
//                 return this.proccessResult(result, false, showPassword, showResetPassData);
//             })
//         );
//     }

//     countUser(): Observable<number> {
//         const sql = 'SELECT COUNT(*) AS COUNT FROM USER';
//         return this.database.query(sql).pipe(
//             map((rawCount) => rawCount[0].COUNT)
//         );
//     }

//     updateCode(id: string, resetPassCode: string): Observable<any> {

//         const sql = `UPDATE USER
//                         SET RESETPASSCODE = ?,
//                             ISRESETPASS = FALSE,
//                             DT_RESETPASSLIMIT = DATE_ADD(NOW(), INTERVAL 10 MINUTE)
//                         WHERE USR_ID = ?`;
//         const values = [resetPassCode, id];

//         return this.database.query(sql, values);
//     }

//     checkResetPassCode(id: string, resetPassCode: string): Observable<any> {

//         const sql = `UPDATE USER
//                         SET ISRESETPASS = TRUE
//                         WHERE USR_ID = ? AND RESETPASSCODE = ?`;
//         const values = [id, resetPassCode];

//         return this.database.query(sql, values);
//     }

//     updatePassword(id: string, newPassword: string): Observable<any> {

//         const sql = `UPDATE USER
//                         SET USR_PASSWORD = ?,
//                             ISRESETPASS = FALSE,
//                             RESETPASSCODE = NULL,
//                             DT_RESETPASSLIMIT = NULL,
//                             IS2AUTH = FALSE
//                         WHERE USR_ID = ?`;
//         const values = [newPassword, id];

//         return this.database.query(sql, values);
//     }

//     checkTwoFactorAuthCode(id: string, resetPassCode: string): Observable<any> {

//         const sql = `UPDATE USER
//                         SET ISRESETPASS = FALSE,
//                             IS2AUTH = TRUE,
//                             RESETPASSCODE = NULL
//                         WHERE USR_ID = ? AND RESETPASSCODE = ?`;
//         const values = [id, resetPassCode];

//         return this.database.query(sql, values);
//     }

//     disableTwoFactorAuth(id: string, resetPassCode: string): Observable<any> {
//         const sql = `UPDATE USER
//                         SET IS2AUTH = FALSE,
//                             RESETPASSCODE = NULL
//                         WHERE USR_ID = ? AND RESETPASSCODE = ?`;
//         const values = [id, resetPassCode];

//         return this.database.query(sql, values);
//     }
// }
