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
