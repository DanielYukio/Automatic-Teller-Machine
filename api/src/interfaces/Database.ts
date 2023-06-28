import { Account, User } from '@prisma/client';
import { TransactionType } from '../enum';

export interface IUser extends User {
    account?: Account
}

export interface ITransaction {
    id: number;
    amount: number;
    type: TransactionType,
    originAccountNumber: number;
}

export interface ITransfer extends ITransaction {
    secondaryAccountNumber: number;
}
