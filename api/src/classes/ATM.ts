import { TransactionStrategy } from '../interfaces';
import { Transaction, TransactionType } from '@prisma/client';
import { TransactionStrategyFactory } from './TransactionFactory';

export class ATM {
    private transactionStrategy?: TransactionStrategy;

    constructor() {
    }

    performTransaction(data: Transaction) {
        this.transactionStrategy = TransactionStrategyFactory.create(data.type);
        return this.transactionStrategy.execute(data);
    }
}
