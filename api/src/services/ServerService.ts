import express, { Express } from 'express';
import cors from 'cors';
import { Log } from '../utils';
import { ServerConfig } from '../config';
import { AccountRouter, AuthRouter, TransactionRouter, UserRouter } from '../routers';
import { Authenticate } from '../middlewares';

export class ServerService {
    private static _instance: ServerService | null;

    private _server: Express = express();

    private constructor() { }

    public static get instance(): ServerService {
        if (!ServerService._instance) {
            ServerService._instance = new ServerService();
        }

        return ServerService._instance;
    }

    public static destroyInstance(): void {
        ServerService._instance = null;
    }

    private config(): void {
        this._server.use(express.json({ limit: '100mb' }));
        this._server.use(express.urlencoded({ extended: true }));
        this._server.use(cors());
    }

    private setupRouters(): void {
        this._server.use('/auth', AuthRouter);
        this._server.use('/user', UserRouter);
        this._server.use('/transaction', Authenticate, TransactionRouter);
        this._server.use('/account', Authenticate, AccountRouter);
    }

    public start(): void {
        Log('Iniciando o Servidor', '');

        Log('Definindo Configurações do Servidor', '');
        this.config();
        Log('Servidor Configurado com Sucesso.', '');

        Log('Carregando as Rotas do Servidor', '');
        this.setupRouters();
        Log('Rotas Carregadas com Sucesso no Servidor.', '');

        this._server.listen(ServerConfig.SVR_PORT, () => {
            Log(`Servidor Rodando na Porta ${ServerConfig.SVR_PORT}`, '');
        });
    }

    public get server(): Express {
        return this._server;
    }
}
