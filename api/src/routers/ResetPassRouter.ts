import { Router } from 'express';
import { codeExpired, HttpResponse } from '../utils';
import { UserProvider } from '../providers';
import { of, switchMap, throwError } from 'rxjs';
import { generate } from 'generate-password';
import { ServerConfig } from '../config';
import { MailService } from '../services';
import bcrypt from 'bcrypt';
import { Authenticate } from '../middlewares';
import { VerifyPrivilegeMaster } from '../middlewares';

const userProvider = UserProvider.instance;

export const ResetPassRouter = Router();

ResetPassRouter.get('/resetRequest', (request, response) => {

    const USR_EMAIL = request.query.USR_EMAIL as string;

    if (!USR_EMAIL) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    userProvider.readByEmail(USR_EMAIL).pipe(
        switchMap((emailExists) => {
            if (emailExists.length <= 0) {
                return throwError(() => 'E-mail Não Cadastrado no Sistema.');
            }

            const code = generate({ length: 5, numbers: true, symbols: false, lowercase: false });

            return userProvider.updateCode(String(emailExists[0].USR_ID), code).pipe(
                switchMap((result) => {

                    if (result.affectedRows === 0) {
                        return throwError(() => 'Falha ao Enviar Código, Tente Novamente.');
                    }

                    if (!ServerConfig.SVR_DEV_MODE) {
                        return MailService.instance.sendMailResetPassCode(emailExists[0].USR_NAME, emailExists[0].USR_EMAIL, code);
                    }

                    return of(-1);
                })
            );
        })).subscribe({
            next: () => {
                return HttpResponse.exitWith201(response, `Código enviado, Verifique Seu E-Mail.`);
            },
            error: (error) => {
                return HttpResponse.exitWith500(response, 'Falha (Interna) ao Enviar Código. ', error);
            }
        });
});

ResetPassRouter.post('/checkCode', (request, response) => {

    const USR_EMAIL = request.body.USR_EMAIL as string | undefined;
    const RESETPASSCODE = request.body.RESETPASSCODE as string | undefined;

    if (!RESETPASSCODE || !USR_EMAIL) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    userProvider.readByEmail(USR_EMAIL, false, true).pipe(
        switchMap((emailExists) => {
            if (emailExists.length <= 0) {
                return throwError(() => 'E-mail Não Cadastrado no Sistema.');
            }

            const user = emailExists[0];

            if (user.RESETPASSCODE !== RESETPASSCODE || !user.DT_RESETPASSLIMIT) {
                return throwError(() => 'Código para Mudança de Senha Inválido.');
            }

            const dateLimit = new Date(user.DT_RESETPASSLIMIT as string);
            if (codeExpired(dateLimit)) {
                return throwError(() => 'Código Expirado, Tente Reenviá-lo.');
            }

            return userProvider.checkResetPassCode(String(user.USR_ID), RESETPASSCODE);

        })).subscribe({
            next: () => {
                return HttpResponse.exitWith201(response, `Código Válido, Altere sua Senha.`);
            },
            error: (error) => {
                return HttpResponse.exitWith500(response, 'Falha (Interna) ao Verificar Código.', error);
            }
        });

});

ResetPassRouter.post('/resetPass', (request, response) => {

    const USR_EMAIL = request.body.USR_EMAIL as string | undefined;
    const NEW_PASSWORD = request.body.NEW_PASSWORD as string | undefined;

    if (!USR_EMAIL || !NEW_PASSWORD) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    userProvider.readByEmail(USR_EMAIL, false, true).pipe(
        switchMap((emailExists) => {
            if (emailExists.length <= 0) {
                return throwError(() => 'E-mail Não Cadastrado no Sistema.');
            }

            const user = emailExists[0];

            if (!user.DT_RESETPASSLIMIT || Boolean(user.ISRESETPASS) === false) {
                return throwError(() => 'Mudança de Senha não Foi Corretamente Solicitada.');
            }

            const dateLimit = new Date(user.DT_RESETPASSLIMIT as string);
            if (codeExpired(dateLimit)) {
                return throwError(() => 'Código Expirado, Tente Reenviá-lo.');
            }

            const passwordHash = bcrypt.hashSync(NEW_PASSWORD, bcrypt.genSaltSync(12));

            return userProvider.updatePassword(String(user.USR_ID), passwordHash).pipe(
                switchMap((result) => {
                    if (result.affectedRows === 0) {
                        return throwError(() => 'Falha (Interna) ao Alterar Senha.');
                    }
                    if (!ServerConfig.SVR_DEV_MODE) {
                        return MailService.instance.sendMailNewPassword(user.USR_NAME, user.USR_EMAIL);
                    }
                    return of(-1);
                }));
        })).subscribe({
            next: () => {
                return HttpResponse.exitWith201(response, `Senha Alterada com Sucesso.`);
            },
            error: (error) => {
                return HttpResponse.exitWith500(response, 'Falha (Interna) ao Atualizar Senha. ', error);
            }
        });

});

ResetPassRouter.post('/resetPass/:id', Authenticate, VerifyPrivilegeMaster, (request, response) => {

    const USR_ID = request.params.id as string | undefined;

    if (!USR_ID || isNaN(Number(USR_ID))) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    const password = generate({ length: 12, numbers: true, symbols: true });
    const NEW_PASSWORD = bcrypt.hashSync(password, bcrypt.genSaltSync(12));

    userProvider.readByID(USR_ID).pipe(
        switchMap((userExists) => {
            if (userExists.length <= 0) {
                return throwError(() => 'Usuário não Existe no Sistema.');
            }

            const user = userExists[0];

            return userProvider.updatePassword(String(user.USR_ID), NEW_PASSWORD).pipe(
                switchMap((result) => {
                    if (result.affectedRows === 0) {
                        return throwError(() => 'Falha (Interna) ao Alterar Senha.');
                    }

                    if (!ServerConfig.SVR_DEV_MODE) {
                        return MailService.instance.sendMailNewPasswordAdmin(user.USR_NAME, user.USR_EMAIL, password);
                    }

                    return of(-1);
                })
            );

        })).subscribe({
            next: () => {
                return HttpResponse.exitWith201(response, `Senha do Usuário Alterada com Sucesso!`);
            },
            error: (error) => {
                return HttpResponse.exitWith500(response, 'Falha (Interna) ao Alterar Senha do Usuário. ', error);
            }
        });
});


