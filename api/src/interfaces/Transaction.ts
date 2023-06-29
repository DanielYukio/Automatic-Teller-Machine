import { Observable } from 'rxjs';
import { Transaction } from '@prisma/client';
import { statusCode } from '../utils';

export interface ITransactionResponse {
    success: boolean;
    message?: string;
    httpStatusCode?: statusCode;
}

export interface ITransferTransaction extends Transaction {
    secondaryAccountNumber: number;
}

export interface TransactionStrategy {
    execute(data: Transaction): Observable<string>;
}
