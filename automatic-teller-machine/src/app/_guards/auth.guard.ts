import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SessionService } from '../_services';
import { LoginComponent } from '../components/login/login.component';
import { RegisterComponent } from '../components/register/register.component';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private session: SessionService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if ((!this.session.isToken) && route.component !== LoginComponent && route.component !== RegisterComponent) {
      this.router.navigate(['/login']);
      return false;
    }

    if ((this.session.isToken) && (route.component === LoginComponent || route.component === RegisterComponent)) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }

}
