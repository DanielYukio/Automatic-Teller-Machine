import { Router } from 'express';
import { HttpResponse } from '../utils';
import { IUser, IFilter, IUnity, IClient } from '../interfaces';
import { ClientProvider, UnityProvider, UserProvider } from '../providers';
import { Status, Privileges as Priv } from '../enum';
import { throwError, switchMap, Observable, of } from 'rxjs';
import { generate } from 'generate-password';
import bcrypt from 'bcrypt';
import { MailService } from '../services';
import { ServerConfig } from '../config';
import { VerifyPrivilegeMaster } from '../middlewares';

export const UserRouter = Router();

const userProvider = UserProvider.instance;
const clientProvider = ClientProvider.instance;
const unityProvider = UnityProvider.instance;

UserRouter.post('', VerifyPrivilegeMaster, (request, response) => {
    const object: IUser = request.body;

    if (!object.USR_NAME || !object.USR_EMAIL || !object.USR_STATUS || !object.USR_PRIVILEGE) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    if (!Object.values(Status).includes(object.USR_STATUS)) {
        return HttpResponse.exitWith401(response, 'Status com Valor Inválido.');
    }

    if (!Object.values(Priv).includes(object.USR_PRIVILEGE)) {
        return HttpResponse.exitWith401(response, 'Privilegio com Valor Inválido.');
    }

    if (object.USR_PRIVILEGE !== Priv.Master && (!object.USR_COMPANY_ID || isNaN(Number(object.USR_COMPANY_ID)))) {
        return HttpResponse.exitWith401(response, 'Usuário com Código de Empresa Inválido.');
    }

    if (object.USR_PRIVILEGE === Priv.Master) {
        object.USR_COMPANY_ID = undefined;
    }

    const password = generate({ length: 12, numbers: true, symbols: true });
    object.USR_PASSWORD = bcrypt.hashSync(password, bcrypt.genSaltSync(12));

    userProvider.readByEmail(object.USR_EMAIL).pipe(
        switchMap((emailExists) => {

            if (emailExists.length > 0) {
                return throwError(() => 'Email de Usuário Já Está em Uso.');
            }

            if (object.USR_PRIVILEGE !== Priv.Master) {
                const companyProvider = object.USR_PRIVILEGE === Priv.Cliente ? clientProvider : unityProvider;
                const readCompany: Observable<IClient[] | IUnity[]> = companyProvider.readByID(`${object.USR_COMPANY_ID}`);

                return readCompany.pipe(
                    switchMap((companyExists) => {
                        if (companyExists.length === 0) {
                            return throwError(() => 'Empresa do Usuário Inválida.');
                        }

                        return userProvider.insert(object);
                    })
                );
            }

            return userProvider.insert(object).pipe(
                switchMap((result) => {

                    if (result.affectedRows === 0) {
                        return throwError(() => 'Falha ao Cadastrar Usuário, Tente Novamente.');
                    }

                    if (!ServerConfig.SVR_DEV_MODE) {
                        return MailService.instance.sendMailNewUser(object.USR_NAME, object.USR_EMAIL, password);
                    }

                    return of(-1);
                })
            );
        })).subscribe({
            next: () => {
                return HttpResponse.exitWith201(response, `Usuário Cadastrado com Sucesso.`);
            },
            error: (error) => {
                return HttpResponse.exitWith500(response, 'Falha (Interna) ao Cadastrar Usuário. ', error);
            }
        });
});

UserRouter.get('', VerifyPrivilegeMaster, (request, response) => {
    userProvider.readAll().subscribe({
        next: (result: any) => {
            return HttpResponse.exitWith200(response, `Usuários Listados com Sucesso.`, result);
        },
        error: (error: any) => {
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Consultar Usuários.', error);
        }
    });
});

UserRouter.get('/:id', (request, response) => {
    const user = JSON.parse(request.query.user as string);
    const id = request.params.id;

    if (user.USR_PRIVILEGE !== Priv.Master && user.USR_ID.toString() !== id) {
        return HttpResponse.exitWith401(response, 'Operação Não Permitida Para Este Usuário.');
    }

    if (isNaN(Number(id))) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    userProvider.readByID(id, true).subscribe({
        next: (result: any) => {
            if (result.length === 0) {
                return HttpResponse.exitWith404(response, `Nenhum Usuário Encontrado com Código: ${id}`);
            } else if (result.length > 1) {
                return HttpResponse.exitWith502(response, `Usuário com Código ${id} Duplicado, Contate o Suporte.`);
            }

            return HttpResponse.exitWith200(response, `Usuário com Código ${id} Encontrada com Sucesso.`, result[0]);
        },
        error: (error: any) => {
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Consultar Usuários.', error);
        }
    });
});

UserRouter.get('/:page/:pageSize', VerifyPrivilegeMaster, (request, response) => {
    const page = request.params.page;
    const pageSize = request.params.pageSize;
    const sort = request.query.sort as string | undefined;
    const search = request.query.search as string | undefined;
    const columnSort = request.query.columnSort as string | undefined;

    const columns = ['USR_ID', 'USR_PROFILE', 'USR_NAME', 'USR_EMAIL', 'USR_PASSWORD', 'USR_STATUS', 'USR_NOTES', 'USR_DT_CREATE', 'USR_DT_UPDATE', 'USR_PRIVILEGE', 'USR_COMPANY_ID'];

    if (isNaN(Number(page)) || isNaN(Number(pageSize))) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    if (columnSort && !columns.find((column) => column === columnSort)) {
        return HttpResponse.exitWith404(response, `Coluna ${columnSort} Inválida.`);
    }

    if (sort && sort !== 'ASC' && sort !== 'DESC') {
        return HttpResponse.exitWith401(response, 'Ordenação de Coluna Inválida.');
    }

    const filter: IFilter = {
        page: Number(page) * Number(pageSize),
        pageSize: Number(pageSize),
        columnSort,
        search,
        sort: sort as 'ASC' | 'DESC' | undefined
    };

    userProvider.filterData(filter).subscribe({
        next: (result) => {
            return HttpResponse.exitWith200(response, 'Usuários Listados com Sucesso.', result);
        },
        error: (error) => {
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Consultar Usuários.', error);
        }
    });

});

UserRouter.put('', VerifyPrivilegeMaster, (request, response) => {
    const object: IUser = request.body;

    if (!object.USR_ID || isNaN(Number(object.USR_ID)) || !object.USR_NAME || !object.USR_EMAIL || !object.USR_STATUS || !object.USR_PRIVILEGE) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    if (!Object.values(Status).includes(object.USR_STATUS)) {
        return HttpResponse.exitWith401(response, 'Status com Valor Inválido.');
    }

    if (!Object.values(Priv).includes(object.USR_PRIVILEGE)) {
        return HttpResponse.exitWith401(response, 'Privilegio com Valor Inválido.');
    }

    if (object.USR_PRIVILEGE !== Priv.Master && !object.USR_COMPANY_ID || isNaN(Number(object.USR_COMPANY_ID))) {
        return HttpResponse.exitWith401(response, 'Usuário com Código de Empresa Inválido.');
    }

    if (object.USR_PRIVILEGE === Priv.Master) {
        object.USR_COMPANY_ID = undefined;
    }

    userProvider.readByEmail(object.USR_EMAIL).pipe(
        switchMap((emailExists) => {
            if (emailExists.length > 0 && Number(emailExists[0].USR_ID) !== Number(object.USR_ID)) {
                return throwError(() => 'Email de Usuário Já Está em Uso.');
            }

            if (object.USR_PRIVILEGE !== Priv.Master) {
                const companyProvider = object.USR_PRIVILEGE === Priv.Cliente ? clientProvider : unityProvider;
                const readCompany: Observable<IClient[] | IUnity[]> = companyProvider.readByID(`${object.USR_COMPANY_ID}`);

                return readCompany.pipe(
                    switchMap((companyExists) => {
                        if (companyExists.length === 0) {
                            return throwError(() => 'Empresa do Usuário Inválida.');
                        }

                        return userProvider.update(object);
                    })
                );
            }

            return userProvider.update(object);
        })).subscribe({
            next: (result) => {
                if (result.affectedRows === 0) {
                    return HttpResponse.exitWith502(response, 'Falha ao Atualizar Usuário, Tente Novamente.');
                }

                return HttpResponse.exitWith201(response, `Usuário Atualizado com Sucesso.`);
            },
            error: (error) => {
                return HttpResponse.exitWith500(response, 'Falha (Interna) ao Atualizar Usuário. ', error);
            }
        });
});

UserRouter.patch('', (request, response) => {
    const user = JSON.parse(request.query.user as string);
    const object: any = request.body;

    if (user.USR_ID !== object.USR_ID) {
        return HttpResponse.exitWith401(response, 'Operação Não Permitida Para Este Usuário.');
    }

    if (!object.USR_ID || isNaN(Number(object.USR_ID)) || !object.USR_NAME || !object.USR_EMAIL) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    userProvider.readByEmail(object.USR_EMAIL).pipe(
        switchMap((emailExists) => {

            if (emailExists.length > 0 && Number(emailExists[0].USR_ID) !== Number(object.USR_ID)) {
                return throwError(() => 'Email de Usuário Já Está em Uso.');
            }

            return userProvider.updatePartial(object);
        }),
    ).subscribe({
        next: (result) => {
            if (result.affectedRows === 0) {
                return HttpResponse.exitWith502(response, 'Falha ao Atualizar Usuário, Tente Novamente.');
            }
            return HttpResponse.exitWith201(response, `Usuário Atualizado com Sucesso.`);
        },
        error: (error) => {
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Atualizar Usuário. ', error);
        }
    });
});

UserRouter.delete('/:id', VerifyPrivilegeMaster, (request, response) => {
    const id = request.params.id;

    if (!id || isNaN(Number(id))) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    userProvider.delete(id).subscribe({
        next: (result) => {
            if (result.affectedRows === 0) {
                return HttpResponse.exitWith502(response, 'Falha ao Excluir Usuário, Tente Novamente.');
            }

            return HttpResponse.exitWith200(response, 'Usuário Excluído com Sucesso.');
        },
        error: (error) => {
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Excluir Usuário.', error);
        }
    });

});
