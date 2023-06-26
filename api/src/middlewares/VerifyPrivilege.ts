import { HttpResponse } from '../utils';
import { NextFunction, Request, Response } from 'express';
import { Privileges as Priv } from '../enum';

export const VerifyPrivilegeMaster = (request: Request, response: Response, next: NextFunction) => {
    if (!request.query) {
        return HttpResponse.exitWith401(response, 'Token de Acesso Inválido, Tente Novamente');
    }

    const user = JSON.parse(request.query.user as string);

    if (user.USR_PRIVILEGE !== Priv.Master) {
        return HttpResponse.exitWith401(response, 'Operação Não Permitida Para Este Usuário.');
    }

    next();
};

export const VerifyPrivilege = (request: Request, response: Response, next: NextFunction) => {
    if (!request.query) {
        return HttpResponse.exitWith401(response, 'Token de Acesso Inválido, Tente Novamente');
    }

    const user = JSON.parse(request.query.user as string);

    if (!Object.values(Priv).includes(user.USR_PRIVILEGE)) {
        return HttpResponse.exitWith401(response, 'Usuário Inválido, Contate o Suporte.');
    }

    next();
};
