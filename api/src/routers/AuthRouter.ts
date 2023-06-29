import { from, of, switchMap, throwError } from 'rxjs';
import { Router } from 'express';
import { HttpResponse, SinglePrisma } from '../utils';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ServerConfig } from '../config';
const prisma = SinglePrisma.instance;

declare global {
    interface BigInt {
        toJSON(): number;
    }
}

BigInt.prototype.toJSON = () => {
    // tslint:disable-next-line:radix
    const int = Number.parseInt((this || '').toString());
    return int ?? (this || '').toString();
};

export const AuthRouter = Router();

AuthRouter.post('/login', (request, response) => {
    const body = request.body;

    if (!body.email || !body.password) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    const email = body.email;
    const password = body.password;

    from(prisma.user.findUnique({ where: { email } })).pipe(
        switchMap((user) => {
            if (!user) {
                return throwError(() => 'E-mail Não Cadastrado.');
            }

            if (!bcrypt.compareSync(password, user.password)) {
                return throwError(() => 'Senha Inválida, Tente Novamente.');
            }

            const token = jwt.sign({ id: Number(user.id) }, ServerConfig.SVR_PASSWORD, { expiresIn: '2h' }); // 0.004h
            console.log(JSON.stringify(user));
            const usr: any = user;
            if (usr.password) {
                delete usr['password'];
            }
            return of({ auth: true, token, user: usr });
        })
    ).subscribe({
        next: (result) => {
            return HttpResponse.exitWith200(response, 'Login efetuado com sucesso', result);
        },
        error: (error) => {
            if (typeof error === 'string') {
                return HttpResponse.exitWith401(response, error);
            }
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Efetuar Login.', error);
        }
    });
});
