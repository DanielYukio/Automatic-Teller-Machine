import { Router } from 'express';
import { HttpResponse } from '../utils';
import { ILoggedUser } from '../interfaces';

export const AccountRouter = Router();

AccountRouter.get('/info', (request, response) => {
    const user: ILoggedUser = JSON.parse(request.query.user as string);
    return HttpResponse.exitWith200(response, 'Informações da Conta Consultadas com Sucesso!', user.account);
});
