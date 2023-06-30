import { Transaction, TransactionType } from '@prisma/client';
import { GetResult, Decimal } from '@prisma/client/runtime';
import { Observable, from, of, switchMap } from 'rxjs';
import { SinglePrisma, statusCode } from '../utils';
import { ITransactionResponse } from '../interfaces';

export abstract class TransactionValidator {
    private nextValidator: TransactionValidator | null = null;

    setNextValidator(validator: TransactionValidator) {
        this.nextValidator = validator;
        return this;
    }

    abstract validate(data: Transaction): Observable<ITransactionResponse>;

    validateNext(data: Transaction): Observable<ITransactionResponse> {
        if (this.nextValidator) {
            return this.nextValidator.validate(data);
        }
        return of({ success: true });
    }
}

// tslint:disable-next-line:max-classes-per-file
export class TransactionDataValidator extends TransactionValidator {
    validate(data: Transaction): Observable<ITransactionResponse> {
        if (!data.amount || !data.originAccountNumber || !data.type) {
            return of({
                success: false,
                httpStatusCode: 400,
                message: 'Parâmetros ausentes para efetuar transação'
            });
        } else {
            if (data.type === TransactionType.TRANSFERENCIA && !data.secondaryAccountNumber) {
                return of({
                    success: false,
                    httpStatusCode: 400,
                    message: 'Número da conta recebedora não informado'
                });
            } else if (data.originAccountNumber === data.secondaryAccountNumber) {
                return of({
                    success: false,
                    httpStatusCode: 400,
                    message: 'Número da conta recebedora precisa ser diferente da conta de origem'
                });
            }
        }
        return this.validateNext(data);
    }
}

// tslint:disable-next-line:max-classes-per-file
export class TransactionTypeValidator extends TransactionValidator {
    validate(data: Transaction): Observable<ITransactionResponse> {
        if (![TransactionType.DEPOSITO, TransactionType.SAQUE, TransactionType.TRANSFERENCIA].includes(data.type)) {
            return of({
                success: false,
                httpStatusCode: 400,
                message: 'Tipo de Transação Inválida'
            });
        }
        return this.validateNext(data);
    }
}

// tslint:disable-next-line:max-classes-per-file
export class AmountValidator extends TransactionValidator {

    constructor(private userBalance: number) { super(); }

    validate(data: Transaction): Observable<ITransactionResponse> {
        if (data.type === TransactionType.SAQUE || data.type === TransactionType.TRANSFERENCIA) {
            if (Number(data.amount) > this.userBalance) {
                return of({
                    success: false,
                    httpStatusCode: 400,
                    message: 'Saldo Insuficiente para realizar transação'
                });
            }
        }
        return this.validateNext(data);
    }
}

// tslint:disable-next-line:max-classes-per-file
export class AccountValidator extends TransactionValidator {
    constructor(private userAccountNumber: number) { super(); }

    validate(data: Transaction): Observable<ITransactionResponse> {
        return (data.originAccountNumber !== this.userAccountNumber)
            ? of({
                success: false,
                httpStatusCode: 401 as statusCode,
                message: 'Número da conta Inválido'
            })
            : from(SinglePrisma.instance.account.findUnique({
                where: { accountNumber: data.originAccountNumber }
            })).pipe(
                switchMap((originAccount) => {
                    if (!originAccount) {
                        return of({
                            success: false,
                            httpStatusCode: 401 as statusCode,
                            message: 'Número da conta Inválido'
                        });
                    }
                    return (data.type === TransactionType.TRANSFERENCIA)
                        ? from(SinglePrisma.instance.account.findUnique({
                            where: {
                                accountNumber: data.secondaryAccountNumber || undefined
                            }
                        })).pipe(
                            switchMap((secondaryAccount) => {
                                if (!secondaryAccount) {
                                    return of({
                                        success: false,
                                        httpStatusCode: 400 as statusCode,
                                        message: 'Número da conta recebedora é inválido'
                                    });
                                }
                                return this.validateNext(data);
                            })
                        )
                        : this.validateNext(data);
                })
            );
    }
}
