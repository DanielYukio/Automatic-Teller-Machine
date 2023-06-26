import { Privileges as Priv } from '../enum';
import { Status } from '../enum';

export interface IClient {
    CLI_ID: number;
    CLI_DESCRIPTION: string;
    CLI_CNPJ?: string;
    CLI_STATUS: Status.Ativo | Status.Inativo | Status.Bloqueado;
    CLI_NOTES?: string;
    CLI_DT_CREATE: string;
    CLI_DT_UPDATE: string;
}

export interface IUnity {
    UNI_ID: number;
    UNI_DESCRIPTION: string;
    UNI_CNPJ?: string;
    UNI_STATUS: Status.Ativo | Status.Inativo | Status.Bloqueado;
    UNI_CODE?: string;
    UNI_NOTES?: string;
    UNI_CLI_ID: number;
    UNI_DEVICE_CODE: string;
    UNI_DT_CREATE: string;
    UNI_DT_UPDATE: string;
    CLIENT?: IClient;
}

export interface IUser {
    USR_ID: number;
    USR_PROFILE?: string;
    USR_NAME: string;
    USR_EMAIL: string;
    USR_PASSWORD: string;
    USR_STATUS: Status.Ativo | Status.Inativo | Status.Bloqueado;
    USR_NOTES?: string;
    USR_DT_CREATE: string;
    USR_DT_UPDATE: string;
    USR_PRIVILEGE: Priv.Master | Priv.Cliente | Priv.Unidade;
    USR_COMPANY_ID?: number;
    COMPANY?: IClient | IUnity;
    ISRESETPASS?: boolean | number;
    RESETPASSCODE?: string;
    DT_RESETPASSLIMIT?: string;
    IS2AUTH?: boolean | number;
}
