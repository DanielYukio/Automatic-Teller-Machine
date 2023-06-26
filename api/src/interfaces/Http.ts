export interface IResponse {
    code: number;
    error: boolean;
    message: string;
    value?: any;
}

export interface IFilter {
    page: number;
    pageSize: number;
    columnSort?: string;
    sort?: 'ASC' | 'DESC';
    search?: string;
}

export interface IFilterEvents {
    DEVICE_CODE?: string;
    EVE_CLI_ID?: number;
    EVE_UNI_ID?: number;
    page?: number;
    pageSize?: number;
}
