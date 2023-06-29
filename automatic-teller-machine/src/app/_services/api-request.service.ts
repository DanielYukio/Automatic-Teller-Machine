import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import { HttpRouteUtils } from '../_utils';

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
}
