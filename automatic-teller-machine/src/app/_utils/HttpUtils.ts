import { HttpHeaders, HttpParams } from '@angular/common/http';

export abstract class HttpRouteUtils {

    constructor() {
    }

    protected authHeader(token: string | null): HttpHeaders {
        return new HttpHeaders().set('authorization', `auth-token ${token || ''}`);
    }

    protected customHeaders(headers: { [header: string]: any }): HttpHeaders {
        return new HttpHeaders(headers);
    }

    protected queryParams(params: { [param: string]: any }): HttpParams {
        return new HttpParams({ fromObject: params });
    }

}
