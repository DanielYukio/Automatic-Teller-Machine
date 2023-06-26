import { of, switchMap, throwError } from 'rxjs';
import { Router } from 'express';
import { codeExpired, HttpResponse } from '../utils';
import { UserProvider } from '../providers';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ServerConfig } from '../config';
import { IUser } from '../interfaces';
import { generate } from 'generate-password';
import { Privileges as Priv, Status } from '../enum';
import { Authenticate, VerifyPrivilege } from '../middlewares';

const userProvider = UserProvider.instance;

export const AuthRouter = Router();

AuthRouter.post('/login', (request, response) => {
    const body = request.body;

    if (!body.email || !body.password) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    const email = body.email;
    const password = body.password;

    userProvider.readByEmail(email, true).pipe(
        switchMap((users) => {

            if (users.length === 0) {
                return throwError(() => 'E-mail Não Cadastrado, Entre em Contato com o Comercial.');
            }

            if (users.length > 1) {
                return throwError(() => 'E-mail Duplicado, Entre em Contato com o Suporte.');
            }

            const user = users[0];

            if (!bcrypt.compareSync(password, user.USR_PASSWORD)) {
                return throwError(() => 'Senha Inválida, Tente Novamente.');
            }

            const token = jwt.sign({ id: user.USR_ID }, ServerConfig.SVR_PASSWORD, { expiresIn: '2h' }); // 0.004h
            const profileID = user.USR_ID;
            const is2Auth = user.IS2AUTH;
            return is2Auth ? of({ auth: false, is2Auth }) : of({ auth: true, token, profileID });
        })
    ).subscribe({
        next: (result) => {
            let msg = 'Código de Autenticação necessário.';
            if (result.auth === true) {
                msg = 'Login Efetuado com Sucesso.';
            }
            return HttpResponse.exitWith200(response, msg, result);
        },
        error: (error) => {
            if (typeof error === 'string') {
                return HttpResponse.exitWith401(response, error);
            }

            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Efetuar Login.', error);
        }
    });
});

AuthRouter.get('/twoFactorRequest', (request, response) => {
    const USR_EMAIL = request.query.USR_EMAIL as string;

    if (!USR_EMAIL) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    userProvider.readByEmail(USR_EMAIL).pipe(
        switchMap((emailExists) => {
            if (emailExists.length <= 0) {
                return throwError(() => 'E-mail Não Cadastrado no Sistema.');
            }

            const user = emailExists[0];

            const code = generate({ length: 5, numbers: true, symbols: false, lowercase: false });

            return userProvider.updateCode(String(user.USR_ID), code).pipe(
                switchMap((result) => {

                    if (result.affectedRows === 0) {
                        return throwError(() => 'Falha ao Enviar Código, Tente Novamente.');
                    }

                    return of(-1);
                })
            );
        })).subscribe({
            next: () => {
                return HttpResponse.exitWith201(response, `Código enviado, Verifique Seu E-Mail.`);
            },
            error: (error) => {
                if (typeof error === 'string') {
                    return HttpResponse.exitWith401(response, error);
                }
                return HttpResponse.exitWith500(response, 'Falha (Interna) ao Enviar Código. ', error);
            }
        });
});

AuthRouter.post('/twoFactorLogin', (request, response) => {
    const USR_EMAIL = request.body.USR_EMAIL as string | undefined;
    const AUTH_CODE = request.body.AUTH_CODE as string | undefined;

    if (!AUTH_CODE || !USR_EMAIL) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    userProvider.readByEmail(USR_EMAIL, false, true).pipe(
        switchMap((emailExists) => {
            if (emailExists.length <= 0) {
                return throwError(() => 'E-mail Não Cadastrado no Sistema.');
            }

            const user = emailExists[0];

            if (Boolean(user.IS2AUTH) === false) {
                return throwError(() => 'Sem necessidade de Código, a Dupla Autenticação está Desabilitada.');
            }

            if (user.RESETPASSCODE !== AUTH_CODE || !user.DT_RESETPASSLIMIT) {
                return throwError(() => 'Código Inválido, Tente Novamente.');
            }

            const dateLimit = new Date(user.DT_RESETPASSLIMIT as string);
            if (codeExpired(dateLimit)) {
                return throwError(() => 'Código Expirado, Tente Reenviá-lo.');
            }

            return UserProvider.instance.checkTwoFactorAuthCode(String(user.USR_ID), AUTH_CODE).pipe(
                switchMap(() => {
                    return of({ id: user.USR_ID });
                })
            );

        })).subscribe({
            next: (result) => {
                const id = result.id;
                const token = jwt.sign({ id }, ServerConfig.SVR_PASSWORD, { expiresIn: '2h' });
                const profileID = id;
                const newResult = { auth: true, token, profileID };
                return HttpResponse.exitWith201(response, `Login Efetuado com Sucesso!`, newResult);
            },
            error: (error) => {
                if (typeof error === 'string') {
                    return HttpResponse.exitWith401(response, error);
                }
                return HttpResponse.exitWith500(response, 'Falha (Interna) ao Verificar Código.', error);
            }
        });
});

AuthRouter.post('/twoFactorEnable', Authenticate, VerifyPrivilege, (request, response) => {
    const USR_ID = request.body.USR_ID as string | undefined;
    const AUTH_CODE = request.body.AUTH_CODE as string | undefined;
    const authUser = JSON.parse(request.query.user as string);

    if (!USR_ID || isNaN(Number(USR_ID)) || !AUTH_CODE) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    if (String(authUser.USR_ID) !== String(USR_ID)) {
        return HttpResponse.exitWith401(response, 'Operação Não Permitida Para Este Usuário.');
    }

    userProvider.readByID(USR_ID, false, true).pipe(
        switchMap((userExists) => {
            if (userExists.length <= 0) {
                return throwError(() => 'Usuário Não Existe no Sistema.');
            }

            const user = userExists[0];

            if (user.RESETPASSCODE !== AUTH_CODE || !user.DT_RESETPASSLIMIT) {
                return throwError(() => 'Código Inválido, Tente Novamente.');
            }

            const dateLimit = new Date(user.DT_RESETPASSLIMIT as string);
            if (codeExpired(dateLimit)) {
                return throwError(() => 'Código Expirado, Tente Reenviá-lo.');
            }

            return UserProvider.instance.checkTwoFactorAuthCode(String(user.USR_ID), AUTH_CODE).pipe(
                switchMap((result) => {
                    if (result.affectedRows === 0) {
                        return throwError(() => 'Falha (interna) ao Verificar Código.');
                    }
                    return of({ id: user.USR_ID });
                })
            );

        })).subscribe({
            next: () => {
                return HttpResponse.exitWith201(response, `Autenticação em Duas Etapas Habilitada!`);
            },
            error: (error) => {
                if (typeof error === 'string') {
                    return HttpResponse.exitWith401(response, error);
                }
                return HttpResponse.exitWith500(response, 'Falha (Interna) ao Verificar Código.', error);
            }
        });
});

AuthRouter.patch('/twoFactorDisable', Authenticate, VerifyPrivilege, (request, response) => {
    const USR_ID = request.body.USR_ID as string | undefined;
    const AUTH_CODE = request.body.AUTH_CODE as string | undefined;
    const authUser = JSON.parse(request.query.user as string);

    if (!USR_ID || isNaN(Number(USR_ID)) || !AUTH_CODE) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    if (String(authUser.USR_ID) !== String(USR_ID)) {
        return HttpResponse.exitWith401(response, 'Operação Não Permitida Para Este Usuário.');
    }

    userProvider.readByID(USR_ID, false, true).pipe(
        switchMap((userExists) => {
            if (userExists.length <= 0) {
                return throwError(() => 'Usuário não Existe no Sistema.');
            }

            const user = userExists[0];

            if (user.RESETPASSCODE !== AUTH_CODE || !user.DT_RESETPASSLIMIT) {
                return throwError(() => 'Código Inválido, Tente Novamente.');
            }

            const dateLimit = new Date(user.DT_RESETPASSLIMIT as string);
            if (codeExpired(dateLimit)) {
                return throwError(() => 'Código Expirado, Tente Reenviá-lo.');
            }

            return userProvider.disableTwoFactorAuth(String(user.USR_ID), AUTH_CODE).pipe(
                switchMap((result) => {
                    if (result.affectedRows === 0) {
                        return throwError(() => 'Falha ao Desabilitar Autenticação em Duas Etapas.');
                    }

                    return of(-1);
                })
            );

        })).subscribe({
            next: () => {
                return HttpResponse.exitWith201(response, `Autenticação em Duas Etapas Desabilitada.`);
            },
            error: (error) => {
                if (typeof error === 'string') {
                    return HttpResponse.exitWith401(response, error);
                }
                return HttpResponse.exitWith500(response, 'Falha (Interna) ao Desabilitar a Autenticação em Duas Etapas. ', error);
            }
        });
});

AuthRouter.post('/firstRegister', (request, response) => {

    const body = request.body;

    if (!body.username || !body.email) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    userProvider.countUser().pipe(
        switchMap((count) => {

            if (count !== 0) {
                return throwError(() => 'Sistema Já Possui Usuário Cadastrado.');
            }

            const password = generate({ length: 12, numbers: true, symbols: true });
            const user: IUser = {
                USR_ID: 0,
                USR_NAME: body.username,
                USR_EMAIL: body.email,
                USR_PASSWORD: bcrypt.hashSync(password, bcrypt.genSaltSync(12)),
                USR_DT_CREATE: '',
                USR_DT_UPDATE: '',
                USR_PRIVILEGE: Priv.Master,
                USR_STATUS: Status.Ativo,
            };

            return userProvider.insert(user).pipe(
                switchMap((result) => {

                    if (result.affectedRows === 0) {
                        return throwError(() => 'Falha ao Cadastrar Usuário, Tente Novamente.');
                    }

                    return of(-1);
                })
            );
        })
    ).subscribe({
        next: () => {
            return HttpResponse.exitWith201(response, `Usuário Cadastrado com Sucesso.`);
        },
        error: (error) => {
            if (typeof error === 'string') {
                return HttpResponse.exitWith401(response, error);
            }
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Cadastrar Usuário. ', error);
        }
    });

});

AuthRouter.get('/firstUser', (request, response) => {
    userProvider.countUser().subscribe({
        next: (count) => {
            const hasUser = count !== 0 ? true : false;
            return HttpResponse.exitWith201(response, `Checagem de Primeiro Registro.`, hasUser);
        },
        error: (error) => {
            return HttpResponse.exitWith201(response, `Falha na Checagem de Primeiro Registro.`, error);
        }
    });
});

