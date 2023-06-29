import { IResponse } from '../interfaces';
import { Response } from 'express';

export type statusCode = 200 | 201 | 202 | 400 | 401 | 402 | 404 | 500 | 502;

export class HttpResponse {

    private constructor() { }

    public static exitWithCode(code: statusCode, response: Response, message: string, value?: any) {
        switch (code) {
            case 200:
                return this.exitWith200(response, message, value);
            case 201:
                return this.exitWith201(response, message, value);
            case 202:
                return this.exitWith202(response, message, value);
            case 400:
                return this.exitWith400(response, message, value);
            case 401:
                return this.exitWith401(response, message, value);
            case 402:
                return this.exitWith402(response, message, value);
            case 404:
                return this.exitWith404(response, message, value);
            case 500:
                return this.exitWith500(response, message, value);
            case 502:
                return this.exitWith502(response, message, value);
        }
    }

    public static exitWith200(response: Response, message: string, value?: any): Response {
        const object: IResponse = { code: 200, error: false, message, value };

        return response.status(object.code).json(object);
    }

    public static exitWith201(response: Response, message: string, value?: any): Response {
        const object: IResponse = { code: 201, error: false, message, value };

        return response.status(object.code).json(object);
    }

    public static exitWith202(response: Response, message: string, value?: any): Response {
        const object: IResponse = { code: 202, error: false, message, value };

        return response.status(object.code).json(object);
    }

    public static exitWith400(response: Response, message: string, value?: any): Response {
        const object: IResponse = { code: 400, error: true, message, value };

        return response.status(object.code).json(object);
    }

    public static exitWith401(response: Response, message: string, value?: any): Response {
        const object: IResponse = { code: 401, error: true, message, value };

        return response.status(object.code).json(object);
    }

    public static exitWith402(response: Response, message: string, value?: any): Response {
        const object: IResponse = { code: 402, error: true, message, value };

        return response.status(object.code).json(object);
    }

    public static exitWith404(response: Response, message: string, value?: any): Response {
        const object: IResponse = { code: 404, error: true, message, value };

        return response.status(object.code).json(object);
    }

    public static exitWith500(response: Response, message: string, value?: any): Response {
        const object: IResponse = { code: 500, error: true, message, value };

        return response.status(object.code).json(object);
    }

    public static exitWith502(response: Response, message: string, value?: any): Response {
        const object: IResponse = { code: 502, error: true, message, value };

        return response.status(object.code).json(object);
    }

}
