export interface IResponse<T = any> {
    code: number;
    error: boolean;
    message: string;
    value?: T;
}

export interface IFilter {
    page: number;
    pageSize: number;
    columnSort?: string;
    sort?: 'ASC' | 'DESC';
    search?: string;
}

export interface ILoginParams {
    email: string;
    password: string;
}

export interface IRegisterParans {
    name: string;
    email: string;
    password: string;
}