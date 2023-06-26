import { Observable } from 'rxjs';
import { IFilter } from './Http';

export interface ICrud<X> {
    insert(object: X): Observable<any>;
    readByID(id: string): Observable<X[]>;
    readAll(): Observable<X[]>;
    filterData(filter: IFilter): Observable<{ list: X[], count: number; }>;
    update(object: X): Observable<any>;
    delete(id: string): Observable<any>;
}
