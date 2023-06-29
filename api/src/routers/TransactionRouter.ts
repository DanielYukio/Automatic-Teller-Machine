import { Router } from 'express';
import { HttpResponse, SinglePrisma } from '../utils';
import { ILoggedUser } from '../interfaces';
import { Transaction } from '@prisma/client';
import { ATM, AccountValidator, AmountValidator, TransactionDataValidator, TransactionTypeValidator } from '../classes';
import { switchMap, throwError } from 'rxjs';

export const TransactionRouter = Router();

const prisma = SinglePrisma.instance;

TransactionRouter.post('/execute', (request, response) => {
    const user: ILoggedUser = JSON.parse(request.query.user as string);
    const transation = request.body as Transaction;

    const validator = new TransactionDataValidator().setNextValidator(
        new TransactionTypeValidator().setNextValidator(
            new AmountValidator(Number(user.account.balance)).setNextValidator(
                new AccountValidator(user.accountNumber)
            )
        )
    );

    validator.validate(transation).pipe(
        switchMap((res) => {
            if (!res.success) {
                return throwError(() => res);
            }
            const atm = new ATM();
            return atm.performTransaction(transation);
        })
    ).subscribe({
        next: (result) => {
            return HttpResponse.exitWith200(response, result);
        },
        error: (error) => {
            if (error && error.httpStatusCode) {
                return HttpResponse.exitWithCode(error.httpStatusCode, response, error.message || 'Falha ao Efetuar Operação');
            }
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Efetuar Operação', error);
        }
    });
});

TransactionRouter.get('/:page/:pageSize', (request, response) => {
    const user: ILoggedUser = JSON.parse(request.query.user as string);
    const filter = request.body as Transaction;
});
