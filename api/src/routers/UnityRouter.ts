import { Router } from 'express';
import { ClientProvider, UnityProvider } from '../providers';
import { IUnity, IFilter, IUser, IClient } from '../interfaces';
import { HttpResponse } from '../utils';
import { switchMap, throwError } from 'rxjs';
import { Status } from '../enum';
import { VerifyPrivilegeMaster } from '../middlewares';
import { Privileges as Priv } from '../enum';

const unityProvider = UnityProvider.instance;
const clientProvider = ClientProvider.instance;

export const UnityRouter = Router();

UnityRouter.post('', VerifyPrivilegeMaster, (request, response) => {

    const object: IUnity = request.body;

    if (!object.UNI_DESCRIPTION
        || !object.UNI_STATUS
        || !object.UNI_CLI_ID || isNaN(Number(object.UNI_CLI_ID))
        || !object.UNI_DEVICE_CODE
    ) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    if (!Object.values(Status).includes(object.UNI_STATUS)) {
        return HttpResponse.exitWith401(response, 'Status com valor Inválido.');
    }

    clientProvider.readByID(`${object.UNI_CLI_ID}`).pipe(
        switchMap((clientResult) => {
            if (clientResult.length === 0) {
                return throwError(() => 'Unidade com Cliente Inválido.');
            }
            return unityProvider.insert(object);
        }),
    ).subscribe({
        next: (result) => {
            if (result.affectedRows === 0) {
                return HttpResponse.exitWith502(response, 'Falha ao Cadastrar Unidade, Tente Novamente.');
            }

            return HttpResponse.exitWith201(response, 'Unidade Cadastrada com Sucesso.');
        },
        error: (error) => {
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Cadastrar Unidade.', error);
        }
    });

});

UnityRouter.get('', VerifyPrivilegeMaster, (request, response) => {
    unityProvider.readAll().subscribe({
        next: (result) => {
            return HttpResponse.exitWith200(response, 'Unidades Listadas com Sucesso.', result);
        },
        error: (error) => {
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Consultar Unidades.', error);
        }
    });

});

UnityRouter.get('/:id', VerifyPrivilegeMaster, (request, response) => {
    const id = request.params.id;

    if (isNaN(Number(id))) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    unityProvider.readByID(id).subscribe({
        next: (result) => {
            if (result.length === 0) {
                return HttpResponse.exitWith404(response, `Nenhuma Unidade Encontrado com Código: ${id}`);
            } else if (result.length > 1) {
                return HttpResponse.exitWith502(response, `Unidade com Código ${id} Duplicada, Contate o Suporte.`);
            }

            return HttpResponse.exitWith200(response, `Unidade com Código ${id} Encontrada com Sucesso.`, result[0]);
        },
        error: (error) => {
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Consultar Unidades.', error);
        }
    });
});

UnityRouter.get('/:page/:pageSize', VerifyPrivilegeMaster, (request, response) => {
    const page = request.params.page;
    const pageSize = request.params.pageSize;
    const sort = request.query.sort as string | undefined;
    const search = request.query.search as string | undefined;
    const columnSort = request.query.columnSort as string | undefined;
    const columns = ['UNI_ID', 'UNI_DESCRIPTION', 'UNI_CNPJ', 'UNI_STATUS', 'UNI_CODE', 'UNI_NOTES', 'UNI_CLI_ID', 'UNI_DEVICE_CODE', 'UNI_DT_CREATE', 'UNI_DT_UPDATE'];

    if (isNaN(Number(page)) || isNaN(Number(pageSize))) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    if (columnSort && !columns.find((column) => column === columnSort)) {
        return HttpResponse.exitWith404(response, `Coluna ${columnSort} Não Encontrada.`);
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

    unityProvider.filterData(filter).subscribe({
        next: (result) => {
            return HttpResponse.exitWith200(response, 'Unidades Listadas com Sucesso.', result);
        },
        error: (error) => {
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Consultar Unidades.', error);
        }
    });

});

UnityRouter.get('/:CLI_ID/:page/:pageSize', (request, response) => {
    const user: IUser = JSON.parse(request.query.user as string);
    const page = request.params.page;
    const pageSize = request.params.pageSize;
    const CLI_ID = request.params.CLI_ID;
    const search = request.query.search as string | undefined;
    if (isNaN(Number(page)) || isNaN(Number(pageSize)) || isNaN(Number(CLI_ID))) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    if (user.USR_PRIVILEGE === Priv.Unidade || (user.USR_PRIVILEGE === Priv.Cliente && (user.COMPANY as IClient).CLI_ID.toString() !== CLI_ID)) {
        return HttpResponse.exitWith401(response, 'Operação Não Permitida Para Este Usuário.');
    }

    const filter: IFilter = {
        page: Number(page) * Number(pageSize),
        pageSize: Number(pageSize),
        search,
    };

    clientProvider.readByID(CLI_ID).pipe(
        switchMap((clientResult) => {
            if (clientResult.length === 0) {
                return throwError(() => 'Cliente com ID Inválido .');
            }
            return unityProvider.filterByClient(filter, CLI_ID);
        }),
    ).subscribe({
        next: (result) => {
            return HttpResponse.exitWith200(response, `Unidades do Cliente Listadas com Sucesso.`, result);
        },
        error: (error) => {
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Consultar Unidades.', error);
        }
    });
});

UnityRouter.put('', VerifyPrivilegeMaster, (request, response) => {
    const object: IUnity = request.body;

    if (!object.UNI_ID || isNaN(Number(object.UNI_ID))
        || !object.UNI_DESCRIPTION
        || !object.UNI_STATUS
        || !object.UNI_CLI_ID || (isNaN(Number(object.UNI_CLI_ID)))
        || !object.UNI_DEVICE_CODE
    ) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes pars Operação.');
    }

    if (!Object.values(Status).includes(object.UNI_STATUS)) {
        return HttpResponse.exitWith401(response, 'Status com valor Inválido.');
    }

    clientProvider.readByID(`${object.UNI_CLI_ID}`).pipe(
        switchMap((clientResult) => {

            if (clientResult.length === 0) {
                return throwError(() => 'Unidade com Cliente Inválido.');
            }
            return unityProvider.update(object);
        })
    ).subscribe({
        next: (result) => {
            if (result.affectedRows === 0) {
                return HttpResponse.exitWith502(response, 'Falha ao Atualizar Unidade, Tente Novamente.');
            }

            return HttpResponse.exitWith200(response, 'Unidade Atualizada com Sucesso.');
        },
        error: (error) => {
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Atualizar Unidade.', error);
        }
    });

});

UnityRouter.delete('/:id', VerifyPrivilegeMaster, (request, response) => {
    const id = request.params.id;

    if (!id || isNaN(Number(id))) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    unityProvider.delete(id).subscribe({
        next: (result) => {
            if (result.affectedRows === 0) {
                return HttpResponse.exitWith502(response, 'Falha ao Excluir Cliente, Tente Novamente.');
            }

            return HttpResponse.exitWith200(response, 'Unidade Excluída com Sucesso.');
        },
        error: (error) => {
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Excluir Unidade.', error);
        }
    });

});
