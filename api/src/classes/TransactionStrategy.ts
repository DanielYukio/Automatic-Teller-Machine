import { Transaction, TransactionType } from '@prisma/client';
import { ITransferTransaction, TransactionStrategy } from '../interfaces';
import { SinglePrisma } from '../utils';
import { from, map, switchMap } from 'rxjs';

export class WithdrawStrategy implements TransactionStrategy {
    execute(data: Transaction) {
        return from(SinglePrisma.instance.$transaction([
            SinglePrisma.instance.account.update({
                data: {
                    updateDate: new Date(),
                    balance: { decrement: data.amount }
                },
                where: {
                    accountNumber: data.originAccountNumber
                }
            }),

            SinglePrisma.instance.transaction.create({
                data: {
                    ...data,
                    id: undefined,
                    creationDate: new Date(),
                }
            })
        ])).pipe(
            map(() => 'Transação de Saque Bem-Sucedida!')
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
export class DepositStrategy implements TransactionStrategy {
    execute(data: Transaction) {
        return from(SinglePrisma.instance.$transaction([
            SinglePrisma.instance.account.update({
                data: {
                    updateDate: new Date(),
                    balance: { increment: data.amount }
                },
                where: {
                    accountNumber: data.originAccountNumber
                }
            }),

            SinglePrisma.instance.transaction.create({
                data: {
                    ...data,
                    id: undefined,
                    creationDate: new Date(),
                }
            })
        ])).pipe(
            map(() => 'Transação de Depósito Bem-Sucedida!')
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
export class TransferStrategy implements TransactionStrategy {
    execute(data: ITransferTransaction) {
        return from(SinglePrisma.instance.$transaction([
            SinglePrisma.instance.account.update({
                data: {
                    updateDate: new Date(),
                    balance: { decrement: data.amount }
                },
                where: {
                    accountNumber: data.originAccountNumber
                }
            }),

            SinglePrisma.instance.account.update({
                data: {
                    updateDate: new Date(),
                    balance: { increment: data.amount }
                },
                where: {
                    accountNumber: data.secondaryAccountNumber
                }
            }),

            SinglePrisma.instance.transaction.create({
                data: {
                    ...data,
                    id: undefined,
                    creationDate: new Date(),
                }
            })
        ])).pipe(
            map(() => 'Transação de Transferência Bem-Sucedida!')
        );
    }
}
