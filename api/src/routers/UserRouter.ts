import { Router } from 'express';
import { HttpResponse, SinglePrisma } from '../utils';
import { IFilter, IUser } from '../interfaces';
import { ClientProvider } from '../providers';
import { throwError, switchMap, Observable, of, from, catchError } from 'rxjs';
import { generate } from 'generate-password';
import bcrypt from 'bcrypt';
import { Authenticate } from '../middlewares';

export const UserRouter = Router();

const prisma = SinglePrisma.instance;

UserRouter.post('/insert', (request, response) => {
    const object: IUser = request.body;

    if (!object.name || !object.email || !object.password) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Cadastrar Usuário.');
    }

    object.password = bcrypt.hashSync(object.password, bcrypt.genSaltSync(12));

    from(prisma.user.findUnique({ where: { email: object.email } })).pipe(
        switchMap((emailExists) => {
            console.log(emailExists);

            console.log()
            const accountNumber = Number(generate({
                symbols: false,
                numbers: true,
                lowercase: false,
                uppercase: false,
                length: 6
            }));

            if (emailExists) {
                return throwError(() => 'Email de Usuário Já Está em Uso.');
            }
            return from(prisma.account.create({
                data: {
                    balance: 0,
                    accountNumber,
                    creationDate: new Date(),
                    updateDate: new Date(),
                }
            })).pipe(
                catchError((err => {
                    console.log(err);
                    return of(err)
                }))
            )
        }),
        switchMap((account) => {
            console.log(account);
            return from(prisma.user.create({
                data: {
                    name: object.name,
                    email: object.email,
                    password: object.password!,
                    accountNumber: account.accountNumber,
                    creationDate: new Date(),
                    updateDate: new Date()
                }
            }))
        })
    ).subscribe({
        next: (result) => {
            return HttpResponse.exitWith201(response, `Usuário Cadastrado com Sucesso.`, result.accountNumber);
        },
        error: (error) => {
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Cadastrar Usuário. ', error);
        }
    });
});

UserRouter.get('/profile', Authenticate, (request, response) => {
    const user = JSON.parse(request.query.user as string);
    return HttpResponse.exitWith201(response, `Perfil Obtido com Sucesso.`, user)
})