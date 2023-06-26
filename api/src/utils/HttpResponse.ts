import { IResponse } from '../interfaces';
import { Response } from 'express';

export class HttpResponse {

    private constructor() { }

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
