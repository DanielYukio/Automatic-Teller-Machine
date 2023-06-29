import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import { HttpRouteUtils } from '../_utils';
import { ILoginParams, IRegisterParans, IResponse } from '../_interfaces';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { RouteNames } from '../_enums/EHttp';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends HttpRouteUtils {

  constructor(
    private http: HttpClient,
    private session: SessionService
  ) {
    super();
  }

  public login(value: ILoginParams): Observable<IResponse> {
    return this.http.post<IResponse>(`${environment.apiUrl}${RouteNames.Auth}/login`, value);
  }

  public firstRegister(value: IRegisterParans): Observable<IResponse> {
    return this.http.post<IResponse>(`${environment.apiUrl}${RouteNames.User}/insert`, value);
  }

  public profile(): Observable<IResponse> {
    return this.http.get<any>(`${environment.apiUrl}${RouteNames.User}/profile`, {
      headers: this.authHeader(this.session.getToken())
    });
  }
}
