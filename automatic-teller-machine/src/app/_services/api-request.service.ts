import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import { HttpRouteUtils } from '../_utils';
import { Observable } from 'rxjs';
import { IResponse, ITransaction } from '../_interfaces';
import { environment } from 'src/environments/environment';
import { RouteNames } from '../_enums/EHttp';

@Injectable({
  providedIn: 'root'
})
export class ApiRequestService extends HttpRouteUtils {

  constructor(
    private http: HttpClient,
    private session: SessionService
  ) {
    super();
  }

  public getMyAccount(): Observable<IResponse> {
    return this.http.get<IResponse>(`${environment.apiUrl}${RouteNames.Account}/info`, {
      headers: this.authHeader(this.session.getToken())
    });
  }

  public executeTransaction(data: ITransaction): Observable<IResponse> {
    return this.http.post<IResponse>(`${environment.apiUrl}${RouteNames.Transaction}/execute`,
      data, {
      headers: this.authHeader(this.session.getToken())
    });
  }

}
