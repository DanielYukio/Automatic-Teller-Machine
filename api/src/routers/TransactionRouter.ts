import { Router } from "express";
import { HttpResponse, SinglePrisma } from "../utils";
import { IUser } from "../interfaces";
import { Transaction, TransactionType } from "@prisma/client";

export const TransactionRouter = Router();

const prisma = SinglePrisma.instance;

// function executeTransaction(user: IUser, transation: Transaction) {
//     const obs = (transation.type !== TransactionType.TRANSFERENCIA)
//         ? from(prisma.$transaction([
//         ]))
//         : from(prisma.account.findUnique({
//             where: { accountNumber: transation.secondaryAccountNumber! }
//         })).pipe(
//             switchMap((account) => {
//                 return from(prisma.$transaction([
//                     prisma.account.update({data: {
//                     }})
//                 ]))
//             })
//         )

// }

TransactionRouter.post('/execute', (request, response) => {
    const user: IUser = JSON.parse(request.query.user as string);
    const transation = request.body as Transaction;

    if (!transation.amount || !transation.originAccountNumber || !transation.type) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Realizar Transferência.');
    }

    if (![TransactionType.DEPOSITO, TransactionType.SAQUE, TransactionType.TRANSFERENCIA].includes(transation.type)) {
        return HttpResponse.exitWith400(response, 'Tipo de Transação Inválida');
    }

    if (transation.type === TransactionType.TRANSFERENCIA && !transation.secondaryAccountNumber) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Realizar Saque.');
    }

    if (
        transation.type === TransactionType.SAQUE || transation.type === TransactionType.TRANSFERENCIA
        && (Number(user.account!.balance) <= 0 || user.account!.balance < transation.amount)
    ) {
        return HttpResponse.exitWith400(response, 'Saldo Insuficiente Para Realizar Saque');
    }



    // from(prisma.$transaction([
    //     prisma.account.update({ data: { balance: } })
    // ]))

    //     .subscribe({
    //         next: (result) => {
    //             return HttpResponse.exitWith201(response, `Usuário Cadastrado com Sucesso.`, result.accountNumber);
    //         },
    //         error: (error) => {
    //             return HttpResponse.exitWith500(response, 'Falha (Interna) ao Cadastrar Usuário. ', error);
    //         }
    //     });
});
