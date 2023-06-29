import { Account, TransactionType, User } from '@prisma/client';

export interface ILoggedUser extends User {
    account: Account;
}
