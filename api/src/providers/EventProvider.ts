import { map, Observable, switchMap } from 'rxjs';
import { DatabaseService } from '../services';
import { IFilterEvents } from '../interfaces';

export class EventProvider {
    private static _instance: EventProvider | null;

    private database = DatabaseService.instance;

    private constructor() { }

    public static get instance(): EventProvider {
        if (!EventProvider._instance) {
            EventProvider._instance = new EventProvider();
        }

        return EventProvider._instance;
    }

    public static destroyInstance(): void {
        EventProvider._instance = null;
    }

    public filterData(filter: IFilterEvents, startDate: any, endDate: any): Observable<any> {

        const startDT = `${startDate} 00:00:00`;
        const endDT = `${endDate} 23:59:59`;

        let sql = `SELECT DISTINCT DATE_FORMAT(EV1.EVE_DATETIME,'%d/%m/%Y') AS 'DATA',
                        COALESCE(DESJEJUM.EVE_AMOUNT, 0) AS DESJEJUM,
                        COALESCE(LANCHEM.EVE_AMOUNT, 0)  AS 'LANCHE MANHÃ',
                        COALESCE(ALMOCO.EVE_AMOUNT, 0)  AS ALMOÇO,
                        COALESCE(LANCHET.EVE_AMOUNT, 0)  AS 'LANCHE TARDE',
                        COALESCE(JANTAR.EVE_AMOUNT, 0)  AS JANTAR,
                        COALESCE(CEIA.EVE_AMOUNT, 0)  AS CEIA,
                        (   COALESCE(DESJEJUM.EVE_AMOUNT, 0) +
                            COALESCE(LANCHEM.EVE_AMOUNT, 0) +
                            COALESCE(ALMOCO.EVE_AMOUNT, 0) +
                            COALESCE(LANCHET.EVE_AMOUNT, 0) +
                            COALESCE(JANTAR.EVE_AMOUNT, 0) +
                            COALESCE(CEIA.EVE_AMOUNT, 0)) as TOTAL
                    FROM EVENT EV1

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Desjejum'
                        AND EVE_DEVICE_CODE = ?
                        AND EVE_DATETIME BETWEEN ? AND ?) DESJEJUM
                        ON DESJEJUM.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Lanche da Manha'
                        AND EVE_DEVICE_CODE = ?
                        AND EVE_DATETIME BETWEEN ? AND ? ) LANCHEM
                        ON LANCHEM.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Almoco'
                        AND EVE_DEVICE_CODE = ?
                        AND EVE_DATETIME BETWEEN ? AND ? ) ALMOCO
                        ON ALMOCO.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Lanche da Tarde'
                        AND EVE_DEVICE_CODE = ?
                        AND EVE_DATETIME BETWEEN ? AND ? ) LANCHET
                        ON LANCHET.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Jantar'
                        AND EVE_DEVICE_CODE = ?
                        AND EVE_DATETIME BETWEEN ? AND ? ) JANTAR
                        ON JANTAR.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Ceia'
                        AND EVE_DEVICE_CODE = ?
                        AND EVE_DATETIME BETWEEN ? AND ? ) CEIA
                        ON CEIA.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    WHERE EV1.EVE_DEVICE_CODE = ?
                        AND EV1.EVE_CLI_ID = ?
                        AND EV1.EVE_UNI_ID = ?
                        AND EV1.EVE_DATETIME BETWEEN ? AND ?

                    ORDER BY EV1.EVE_DATETIME`;

        const values = [
            filter.DEVICE_CODE, startDT, endDT,
            filter.DEVICE_CODE, startDT, endDT,
            filter.DEVICE_CODE, startDT, endDT,
            filter.DEVICE_CODE, startDT, endDT,
            filter.DEVICE_CODE, startDT, endDT,
            filter.DEVICE_CODE, startDT, endDT,
            filter.DEVICE_CODE, filter.EVE_CLI_ID, filter.EVE_UNI_ID, startDT, endDT,
        ];

        return this.database.query(sql, values).pipe(
            switchMap((dailyAmount) => {
                sql = `SELECT (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Desjejum'
                                AND EVE_DEVICE_CODE = ?
                                AND EVE_DATETIME BETWEEN ? AND ?) AS DESJEJUM,

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Lanche da Manha'
                                AND EVE_DEVICE_CODE = ?
                                AND EVE_DATETIME BETWEEN ? AND ?)  AS 'LANCHE MANHÃ',

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                                WHERE EVE_MEAL='Almoco'
                                AND EVE_DEVICE_CODE = ?
                                AND EVE_DATETIME BETWEEN ? AND ?)  AS ALMOÇO,

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Lanche da Tarde'
                                AND EVE_DEVICE_CODE = ?
                                AND EVE_DATETIME BETWEEN ? AND ?) AS 'LANCHE TARDE',

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Jantar'
                                AND EVE_DEVICE_CODE = ?
                                AND EVE_DATETIME BETWEEN ? AND ?) AS JANTAR,

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Ceia'
                                AND EVE_DEVICE_CODE = ?
                                AND EVE_DATETIME BETWEEN ? AND ?) AS CEIA,

                            COALESCE(SUM(EVE_AMOUNT), 0) as TOTAL
                        FROM EVENT

                        WHERE EVE_DEVICE_CODE = ?
                            AND EVE_CLI_ID = ?
                            AND EVE_UNI_ID = ?
                            AND EVE_DATETIME BETWEEN ? AND ?;`;

                return this.database.query(sql, values).pipe(
                    map((totalAmount) => {
                        return {
                            dailyResults: dailyAmount, totalResults: totalAmount[0]
                        };
                    })
                );
            })
        );
    }

    public filterDataPagination(filter: IFilterEvents, startDate: any, endDate: any): Observable<any> {

        const startDT = `${startDate} 00:00:00`;
        const endDT = `${endDate} 23:59:59`;

        let sql = `SELECT DISTINCT DATE_FORMAT(EV1.EVE_DATETIME,'%d/%m/%Y') AS 'DATA',
                        COALESCE(DESJEJUM.EVE_AMOUNT, 0) AS DESJEJUM,
                        COALESCE(LANCHEM.EVE_AMOUNT, 0)  AS 'LANCHE MANHÃ',
                        COALESCE(ALMOCO.EVE_AMOUNT, 0)  AS ALMOÇO,
                        COALESCE(LANCHET.EVE_AMOUNT, 0)  AS 'LANCHE TARDE',
                        COALESCE(JANTAR.EVE_AMOUNT, 0)  AS JANTAR,
                        COALESCE(CEIA.EVE_AMOUNT, 0)  AS CEIA,
                        (   COALESCE(DESJEJUM.EVE_AMOUNT, 0) +
                            COALESCE(LANCHEM.EVE_AMOUNT, 0) +
                            COALESCE(ALMOCO.EVE_AMOUNT, 0) +
                            COALESCE(LANCHET.EVE_AMOUNT, 0) +
                            COALESCE(JANTAR.EVE_AMOUNT, 0) +
                            COALESCE(CEIA.EVE_AMOUNT, 0)) as TOTAL
                    FROM EVENT EV1

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Desjejum'
                        AND EVE_DEVICE_CODE = ?
                        AND EVE_DATETIME BETWEEN ? AND ?) DESJEJUM
                        ON DESJEJUM.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Lanche da Manha'
                        AND EVE_DEVICE_CODE = ?
                        AND EVE_DATETIME BETWEEN ? AND ? ) LANCHEM
                        ON LANCHEM.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Almoco'
                        AND EVE_DEVICE_CODE = ?
                        AND EVE_DATETIME BETWEEN ? AND ? ) ALMOCO
                        ON ALMOCO.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Lanche da Tarde'
                        AND EVE_DEVICE_CODE = ?
                        AND EVE_DATETIME BETWEEN ? AND ? ) LANCHET
                        ON LANCHET.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Jantar'
                        AND EVE_DEVICE_CODE = ?
                        AND EVE_DATETIME BETWEEN ? AND ? ) JANTAR
                        ON JANTAR.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Ceia'
                        AND EVE_DEVICE_CODE = ?
                        AND EVE_DATETIME BETWEEN ? AND ? ) CEIA
                        ON CEIA.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    WHERE EV1.EVE_DEVICE_CODE = ?
                        AND EV1.EVE_CLI_ID = ?
                        AND EV1.EVE_UNI_ID = ?
                        AND EV1.EVE_DATETIME BETWEEN ? AND ?

                    ORDER BY EV1.EVE_DATETIME
                    LIMIT ?, ?`;

        let values = [
            filter.DEVICE_CODE, startDT, endDT,
            filter.DEVICE_CODE, startDT, endDT,
            filter.DEVICE_CODE, startDT, endDT,
            filter.DEVICE_CODE, startDT, endDT,
            filter.DEVICE_CODE, startDT, endDT,
            filter.DEVICE_CODE, startDT, endDT,
            filter.DEVICE_CODE, filter.EVE_CLI_ID, filter.EVE_UNI_ID, startDT, endDT,
            filter.page, filter.pageSize
        ];

        return this.database.query(sql, values).pipe(
            switchMap((dailyAmount) => {
                sql = `SELECT (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Desjejum'
                                AND EVE_DEVICE_CODE = ?
                                AND EVE_DATETIME BETWEEN ? AND ?) AS DESJEJUM,

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Lanche da Manha'
                                AND EVE_DEVICE_CODE = ?
                                AND EVE_DATETIME BETWEEN ? AND ?)  AS 'LANCHE MANHÃ',

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                                WHERE EVE_MEAL='Almoco'
                                AND EVE_DEVICE_CODE = ?
                                AND EVE_DATETIME BETWEEN ? AND ?)  AS ALMOÇO,

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Lanche da Tarde'
                                AND EVE_DEVICE_CODE = ?
                                AND EVE_DATETIME BETWEEN ? AND ?) AS 'LANCHE TARDE',

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Jantar'
                                AND EVE_DEVICE_CODE = ?
                                AND EVE_DATETIME BETWEEN ? AND ?) AS JANTAR,

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Ceia'
                                AND EVE_DEVICE_CODE = ?
                                AND EVE_DATETIME BETWEEN ? AND ?) AS CEIA,

                            COALESCE(SUM(EVE_AMOUNT), 0) as TOTAL
                        FROM EVENT

                        WHERE EVE_DEVICE_CODE = ?
                            AND EVE_CLI_ID = ?
                            AND EVE_UNI_ID = ?
                            AND EVE_DATETIME BETWEEN ? AND ?;`;

                values.pop();
                values.pop();

                return this.database.query(sql, values).pipe(
                    switchMap((totalAmount) => {

                        sql = `select count(DISTINCT DATE(EVE_DATETIME)) AS COUNT FROM EVENT
                                WHERE EVE_DEVICE_CODE = ?
                                    AND EVE_CLI_ID = ?
                                    AND EVE_UNI_ID = ?
                                    AND EVE_DATETIME BETWEEN ? AND ?;`;
                        values = [
                            filter.DEVICE_CODE, filter.EVE_CLI_ID, filter.EVE_UNI_ID,
                            startDT, endDT,
                        ];

                        return this.database.query(sql, values).pipe(
                            map((rowCount) => {
                                return {
                                    dailyResults: dailyAmount, count: rowCount[0].COUNT, totalResults: totalAmount[0]
                                };
                            })
                        );
                    })
                );
            })
        );
    }

    public filterClientData(filter: IFilterEvents, startDate: any, endDate: any): Observable<any> {
        const startDT = `${startDate} 00:00:00`;
        const endDT = `${endDate} 23:59:59`;

        let sql = `SELECT DISTINCT DATE_FORMAT(EV1.EVE_DATETIME,'%d/%m/%Y') AS 'DATA',
                        COALESCE(DESJEJUM.EVE_AMOUNT, 0) AS DESJEJUM,
                        COALESCE(LANCHEM.EVE_AMOUNT, 0)  AS 'LANCHE MANHÃ',
                        COALESCE(ALMOCO.EVE_AMOUNT, 0)  AS ALMOÇO,
                        COALESCE(LANCHET.EVE_AMOUNT, 0)  AS 'LANCHE TARDE',
                        COALESCE(JANTAR.EVE_AMOUNT, 0)  AS JANTAR,
                        COALESCE(CEIA.EVE_AMOUNT, 0)  AS CEIA,
                        (   COALESCE(DESJEJUM.EVE_AMOUNT, 0) +
                            COALESCE(LANCHEM.EVE_AMOUNT, 0) +
                            COALESCE(ALMOCO.EVE_AMOUNT, 0) +
                            COALESCE(LANCHET.EVE_AMOUNT, 0) +
                            COALESCE(JANTAR.EVE_AMOUNT, 0) +
                            COALESCE(CEIA.EVE_AMOUNT, 0)) as TOTAL
                    FROM EVENT EV1

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, SUM(EVE_AMOUNT) AS EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Desjejum'
                        AND EVE_CLI_ID = ?
                        AND EVE_DATETIME BETWEEN ? AND ?
                    GROUP BY DATE(EVE_DATETIME)) DESJEJUM
                        ON DESJEJUM.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, SUM(EVE_AMOUNT) AS EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Lanche da Manha'
                        AND EVE_CLI_ID = ?
                        AND EVE_DATETIME BETWEEN ? AND ?
                    GROUP BY DATE(EVE_DATETIME)) LANCHEM
                        ON LANCHEM.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, SUM(EVE_AMOUNT) AS EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Almoco'
                        AND EVE_CLI_ID = ?
                        AND EVE_DATETIME BETWEEN ? AND ?
                    GROUP BY DATE(EVE_DATETIME)) ALMOCO
                        ON ALMOCO.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, SUM(EVE_AMOUNT) AS EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Lanche da Tarde'
                        AND EVE_CLI_ID = ?
                        AND EVE_DATETIME BETWEEN ? AND ?
                    GROUP BY DATE(EVE_DATETIME)) LANCHET
                        ON LANCHET.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, SUM(EVE_AMOUNT) AS EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Jantar'
                        AND EVE_CLI_ID = ?
                        AND EVE_DATETIME BETWEEN ? AND ?
                    GROUP BY DATE(EVE_DATETIME)) JANTAR
                        ON JANTAR.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, SUM(EVE_AMOUNT) AS EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Ceia'
                        AND EVE_CLI_ID = ?
                        AND EVE_DATETIME BETWEEN ? AND ?
                    GROUP BY DATE(EVE_DATETIME)) CEIA
                        ON CEIA.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    WHERE EV1.EVE_CLI_ID = ?
                        AND EV1.EVE_DATETIME BETWEEN ? AND ?

                    ORDER BY EV1.EVE_DATETIME`;

        const values = [
            filter.EVE_CLI_ID, startDT, endDT,
            filter.EVE_CLI_ID, startDT, endDT,
            filter.EVE_CLI_ID, startDT, endDT,
            filter.EVE_CLI_ID, startDT, endDT,
            filter.EVE_CLI_ID, startDT, endDT,
            filter.EVE_CLI_ID, startDT, endDT,
            filter.EVE_CLI_ID, startDT, endDT,
        ];

        return this.database.query(sql, values).pipe(
            switchMap((dailyAmount) => {
                sql = `SELECT (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Desjejum'
                                AND EVE_CLI_ID = ?
                                AND EVE_DATETIME BETWEEN ? AND ?) AS DESJEJUM,

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Lanche da Manha'
                                AND EVE_CLI_ID = ?
                                AND EVE_DATETIME BETWEEN ? AND ?)  AS 'LANCHE MANHÃ',

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                                WHERE EVE_MEAL='Almoco'
                                AND EVE_CLI_ID = ?
                                AND EVE_DATETIME BETWEEN ? AND ?)  AS ALMOÇO,

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Lanche da Tarde'
                                AND EVE_CLI_ID = ?
                                AND EVE_DATETIME BETWEEN ? AND ?) AS 'LANCHE TARDE',

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Jantar'
                                AND EVE_CLI_ID = ?
                                AND EVE_DATETIME BETWEEN ? AND ?) AS JANTAR,

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Ceia'
                                AND EVE_CLI_ID = ?
                                AND EVE_DATETIME BETWEEN ? AND ?) AS CEIA,

                            COALESCE(SUM(EVE_AMOUNT), 0) as TOTAL
                        FROM EVENT

                        WHERE EVE_CLI_ID = ?
                            AND EVE_DATETIME BETWEEN ? AND ?;`;

                return this.database.query(sql, values).pipe(
                    map((totalAmount) => {
                        return {
                            dailyResults: dailyAmount, totalResults: totalAmount[0]
                        };
                    })
                );
            })
        );
    }

    public filterClientDataPagination(filter: IFilterEvents, startDate: any, endDate: any): Observable<any> {
        const startDT = `${startDate} 00:00:00`;
        const endDT = `${endDate} 23:59:59`;

        let sql = `SELECT DISTINCT DATE_FORMAT(EV1.EVE_DATETIME,'%d/%m/%Y') AS 'DATA',
                        COALESCE(DESJEJUM.EVE_AMOUNT, 0) AS DESJEJUM,
                        COALESCE(LANCHEM.EVE_AMOUNT, 0)  AS 'LANCHE MANHÃ',
                        COALESCE(ALMOCO.EVE_AMOUNT, 0)  AS ALMOÇO,
                        COALESCE(LANCHET.EVE_AMOUNT, 0)  AS 'LANCHE TARDE',
                        COALESCE(JANTAR.EVE_AMOUNT, 0)  AS JANTAR,
                        COALESCE(CEIA.EVE_AMOUNT, 0)  AS CEIA,
                        (   COALESCE(DESJEJUM.EVE_AMOUNT, 0) +
                            COALESCE(LANCHEM.EVE_AMOUNT, 0) +
                            COALESCE(ALMOCO.EVE_AMOUNT, 0) +
                            COALESCE(LANCHET.EVE_AMOUNT, 0) +
                            COALESCE(JANTAR.EVE_AMOUNT, 0) +
                            COALESCE(CEIA.EVE_AMOUNT, 0)) as TOTAL
                    FROM EVENT EV1

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, SUM(EVE_AMOUNT) AS EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Desjejum'
                        AND EVE_CLI_ID = ?
                        AND EVE_DATETIME BETWEEN ? AND ?
                    GROUP BY DATE(EVE_DATETIME)) DESJEJUM
                        ON DESJEJUM.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, SUM(EVE_AMOUNT) AS EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Lanche da Manha'
                        AND EVE_CLI_ID = ?
                        AND EVE_DATETIME BETWEEN ? AND ?
                    GROUP BY DATE(EVE_DATETIME)) LANCHEM
                        ON LANCHEM.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, SUM(EVE_AMOUNT) AS EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Almoco'
                        AND EVE_CLI_ID = ?
                        AND EVE_DATETIME BETWEEN ? AND ?
                    GROUP BY DATE(EVE_DATETIME)) ALMOCO
                        ON ALMOCO.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, SUM(EVE_AMOUNT) AS EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Lanche da Tarde'
                        AND EVE_CLI_ID = ?
                        AND EVE_DATETIME BETWEEN ? AND ?
                    GROUP BY DATE(EVE_DATETIME)) LANCHET
                        ON LANCHET.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, SUM(EVE_AMOUNT) AS EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Jantar'
                        AND EVE_CLI_ID = ?
                        AND EVE_DATETIME BETWEEN ? AND ?
                    GROUP BY DATE(EVE_DATETIME)) JANTAR
                        ON JANTAR.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    LEFT JOIN (SELECT DATE(EVE_DATETIME) AS EVE_DATETIME, SUM(EVE_AMOUNT) AS EVE_AMOUNT FROM EVENT
                    WHERE EVE_MEAL='Ceia'
                        AND EVE_CLI_ID = ?
                        AND EVE_DATETIME BETWEEN ? AND ?
                    GROUP BY DATE(EVE_DATETIME)) CEIA
                        ON CEIA.EVE_DATETIME = DATE(EV1.EVE_DATETIME)

                    WHERE EV1.EVE_CLI_ID = ?
                        AND EV1.EVE_DATETIME BETWEEN ? AND ?

                    ORDER BY EV1.EVE_DATETIME
                    LIMIT ?, ?`;

        let values = [
            filter.EVE_CLI_ID, startDT, endDT,
            filter.EVE_CLI_ID, startDT, endDT,
            filter.EVE_CLI_ID, startDT, endDT,
            filter.EVE_CLI_ID, startDT, endDT,
            filter.EVE_CLI_ID, startDT, endDT,
            filter.EVE_CLI_ID, startDT, endDT,
            filter.EVE_CLI_ID, startDT, endDT,
            filter.page, filter.pageSize
        ];

        return this.database.query(sql, values).pipe(
            switchMap((dailyAmount) => {
                sql = `SELECT (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Desjejum'
                                AND EVE_CLI_ID = ?
                                AND EVE_DATETIME BETWEEN ? AND ?) AS DESJEJUM,

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Lanche da Manha'
                                AND EVE_CLI_ID = ?
                                AND EVE_DATETIME BETWEEN ? AND ?)  AS 'LANCHE MANHÃ',

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                                WHERE EVE_MEAL='Almoco'
                                AND EVE_CLI_ID = ?
                                AND EVE_DATETIME BETWEEN ? AND ?)  AS ALMOÇO,

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Lanche da Tarde'
                                AND EVE_CLI_ID = ?
                                AND EVE_DATETIME BETWEEN ? AND ?) AS 'LANCHE TARDE',

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Jantar'
                                AND EVE_CLI_ID = ?
                                AND EVE_DATETIME BETWEEN ? AND ?) AS JANTAR,

                            (SELECT COALESCE(SUM(EVE_AMOUNT), 0) FROM EVENT
                            WHERE EVE_MEAL='Ceia'
                                AND EVE_CLI_ID = ?
                                AND EVE_DATETIME BETWEEN ? AND ?) AS CEIA,

                            COALESCE(SUM(EVE_AMOUNT), 0) as TOTAL
                        FROM EVENT

                        WHERE EVE_CLI_ID = ?
                            AND EVE_DATETIME BETWEEN ? AND ?;`;

                values.pop();
                values.pop();

                return this.database.query(sql, values).pipe(
                    switchMap((totalAmount) => {

                        sql = `select count(DISTINCT DATE(EVE_DATETIME)) AS COUNT FROM EVENT
                                WHERE EVE_CLI_ID = ?
                                    AND EVE_DATETIME BETWEEN ? AND ?;`;

                        values = [
                            filter.EVE_CLI_ID, startDT, endDT,
                        ];

                        return this.database.query(sql, values).pipe(
                            map((rowCount) => {
                                return {
                                    dailyResults: dailyAmount, count: rowCount[0].COUNT, totalResults: totalAmount[0]
                                };
                            })
                        );
                    })
                );
            })
        );
    }

}
