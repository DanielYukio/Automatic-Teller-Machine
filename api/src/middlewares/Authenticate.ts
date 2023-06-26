import { HttpResponse } from './../utils';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ServerConfig } from '../config';
import { Observable, switchMap, throwError, of } from 'rxjs';
import { UserProvider } from '../providers';

export const Authenticate = (request: Request, response: Response, next: NextFunction) => {

    if (!request.headers.authorization) {
        return HttpResponse.exitWith401(response, 'Token de Acesso Não Fornecido.');
    }

    const [prefix, token] = String(request.headers.authorization).split(' ');

    if (!prefix || !token) {
        return HttpResponse.exitWith401(response, 'Token de Acesso Inválido.');
    }

    if (prefix !== 'freaccess-token') {
        return HttpResponse.exitWith401(response, 'Token de Acesso Inválido.');
    }

    const checkToken = new Observable<string>((obs) => {
        jwt.verify(token, ServerConfig.SVR_PASSWORD, (error, decode: any) => {

            if (error) {
                return obs.error('Token de Acesso Expirado, Faça Login Novamente.');
            }

            if (!decode.id) {
                return obs.error('Token Não Possui Código.');
            }

            obs.next(decode.id);
            return obs.complete();
        });
    });

    checkToken.pipe(
        switchMap((id) => UserProvider.instance.readByID(id, false)),
        switchMap((users) => {
            if (users.length !== 1) {
                return throwError(() => 'Token de Acesso Inváilido, Tente Novamente.');
            }

            return of(users[0]);
        })
    ).subscribe({
        next: (user) => {
            request.query.user = JSON.stringify(user);

            next();
        },
        error: (error) => {

            if (typeof error === 'string') {
                return HttpResponse.exitWith401(response, error);
            }

            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Efetuar Autenticação.');
        }
    });
};
