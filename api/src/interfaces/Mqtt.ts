import { Meals } from '../enum';

export interface IEventMessage {
    ID: number;
    DT: string;
    HR: string;
    REF: string | Meals;
    ACS: number;
}
