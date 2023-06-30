import { TransactionType } from "../_enums";

export interface IUser {
    id?: number
    email: string
    name: string
    password: string
    accountNumber: number
    creationDate: Date
    updateDate: Date
}

export interface IAccount {
    id?: number
    accountNumber: number
    balance: number
    creationDate: Date
    updateDate: Date
}

export interface ITransaction {
    id?: number
    amount?: number
    type: TransactionType
    originAccountNumber: number
    secondaryAccountNumber: number | null
    creationDate?: Date
}

export interface ITransferTransaction extends ITransaction {
    secondaryAccountNumber: number;
}