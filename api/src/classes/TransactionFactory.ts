import { TransactionType } from '@prisma/client';
import { TransactionStrategy } from '../interfaces';
import { DepositStrategy, TransferStrategy, WithdrawStrategy } from '.';

export class TransactionStrategyFactory {
    static create(type: TransactionType): TransactionStrategy {
        if (type === TransactionType.SAQUE) {
            return new WithdrawStrategy();
        } else if (type === TransactionType.DEPOSITO) {
            return new DepositStrategy();
        } else {
            return new TransferStrategy();
        }
    }
}
