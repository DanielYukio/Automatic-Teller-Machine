import { HttpResponse, SinglePrisma } from './../utils';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ServerConfig } from '../config';
import { Observable, switchMap, throwError, of, from } from 'rxjs';

export const Authenticate = (request: Request, response: Response, next: NextFunction) => {

    if (!request.headers.authorization) {
        return HttpResponse.exitWith401(response, 'Token de Acesso Não Fornecido.');
    }

    const [prefix, token] = String(request.headers.authorization).split(' ');

    if (!prefix || !token) {
        return HttpResponse.exitWith401(response, 'Token de Acesso Inválido.');
    }

    if (prefix !== 'auth-token') {
        return HttpResponse.exitWith401(response, 'Token de Acesso Inválido.');
    }

    const checkToken = new Observable<number>((obs) => {
        jwt.verify(token, ServerConfig.SVR_PASSWORD, (error, decode: any) => {

            if (error) {
                return obs.error('Token de Acesso Expirado, Faça Login Novamente.');
            }

            if (!decode.id || isNaN(Number(decode.id))) {
                return obs.error('Token Não Possui Código.');
            }

            obs.next(Number(decode.id));
            return obs.complete();
        });
    });

    checkToken.pipe(
        switchMap((id) => from(SinglePrisma.instance.user.findUnique({
            where: { id },
            select: {
                creationDate: true,
                password: false,
                accountNumber: true,
                account: {
                    select: {
                        accountNumber: true,
                        balance: true,
                        creationDate: true,
                    }
                },
                email: true,
                name: true,
                updateDate: true
            }
        }))),
        switchMap((user) => {
            if (!user) {
                return throwError(() => 'Token de Acesso Inváilido, Tente Novamente.');
            }

            return from(SinglePrisma.instance.account.findUnique({ where: { accountNumber: user.accountNumber } })).pipe(
                switchMap((account) => {
                    if (!account) {
                        return throwError(() => 'Usuário com Conta Inválida');
                    }
                    return of(user);
                })
            );
        }),
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
