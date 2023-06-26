import { Router } from 'express';
import { IClient, IFilter } from '../interfaces';
import { ClientProvider } from '../providers';
import { HttpResponse } from '../utils';
import { Status } from '../enum';

const clientProvider = ClientProvider.instance;

export const ClientRouter = Router();

ClientRouter.post('', (request, response) => {

    const object: IClient = request.body;

    if (!object.CLI_DESCRIPTION || !object.CLI_STATUS) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    if (!Object.values(Status).includes(object.CLI_STATUS)) {
        return HttpResponse.exitWith401(response, 'Status com valor Inválido.');
    }

    clientProvider.insert(object).subscribe({
        next: (result) => {
            if (result.affectedRows === 0) {
                return HttpResponse.exitWith502(response, 'Falha ao Cadastrar Cliente, Tente Novamente.');
            }

            return HttpResponse.exitWith201(response, 'Cliente Cadastrado com Sucesso.');
        },
        error: (error) => {
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Cadastrar Cliente.', error);
        }
    });
});

ClientRouter.get('', (request, response) => {

    clientProvider.readAll().subscribe({
        next: (result) => {
            return HttpResponse.exitWith200(response, 'Clientes Listados com Sucesso.', result);
        },
        error: (error) => {
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Consultar Clientes.', error);
        }
    });

});

ClientRouter.get('/:id', (request, response) => {
    const id = request.params.id;

    if (isNaN(Number(id))) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    clientProvider.readByID(id).subscribe({
        next: (result) => {
            if (result.length === 0) {
                return HttpResponse.exitWith404(response, `Nenhum Cliente Encontrado com Código: ${id}`);
            } else if (result.length > 1) {
                return HttpResponse.exitWith502(response, `Cliente com Código ${id} Duplicado, Contate o Suporte.`);
            }

            return HttpResponse.exitWith200(response, `Cliente com Código ${id} Encontrado com Sucesso.`, result[0]);
        },
        error: (error) => {
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Consultar Clientes.', error);
        }
    });
});

ClientRouter.get('/:page/:pageSize', (request, response) => {
    const page = request.params.page;
    const pageSize = request.params.pageSize;
    const sort = request.query.sort as string | undefined;
    const search = request.query.search as string | undefined;
    const columnSort = request.query.columnSort as string | undefined;
    const columns = ['CLI_ID', 'CLI_DESCRIPTION', 'CLI_CNPJ', 'CLI_STATUS', 'CLI_NOTES', 'CLI_DT_CREATE', 'CLI_DT_UPDATE'];

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

    clientProvider.filterData(filter).subscribe({
        next: (result) => {
            return HttpResponse.exitWith200(response, 'Clientes Listados com Sucesso.', result);
        },
        error: (error) => {
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Consultar Clientes.', error);
        }
    });

});

ClientRouter.put('', (request, response) => {
    const object: IClient = request.body;

    if (!object.CLI_ID || isNaN(Number(object.CLI_ID)) || !object.CLI_DESCRIPTION || !object.CLI_STATUS) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes pars Operação.');
    }

    if (!Object.values(Status).includes(object.CLI_STATUS)) {
        return HttpResponse.exitWith401(response, 'Status com valor Inválido.');
    }

    clientProvider.update(object).subscribe({
        next: (result) => {
            if (result.affectedRows === 0) {
                return HttpResponse.exitWith502(response, 'Falha ao Atualizar Cliente, Tente Novamente.');
            }

            return HttpResponse.exitWith200(response, 'Cliente Atualizado com Sucesso.');
        },
        error: (error) => {
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Atualizar Cliente.', error);
        }
    });

});

ClientRouter.delete('/:id', (request, response) => {
    const id = request.params.id;
    if (!id || isNaN(Number(id))) {
        return HttpResponse.exitWith400(response, 'Pârametros Ausentes para Operação.');
    }

    clientProvider.delete(id).subscribe({
        next: (result) => {
            if (result.affectedRows === 0) {
                return HttpResponse.exitWith502(response, 'Falha ao Excluír Cliente, Tente Novamente.');
            }

            return HttpResponse.exitWith200(response, 'Cliente Excluído com Sucesso.');
        },
        error: (error) => {
            return HttpResponse.exitWith500(response, 'Falha (Interna) ao Excluír Cliente.', error);
        }
    });
});
