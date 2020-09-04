import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, NavigationExtras } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class AuthenticationGuard implements CanActivate {

  constructor(private router: Router) {

  }
  

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (!localStorage.accessToken) {
      this.router.navigate(['login']);
      return false;
    } else {
      return true;
    }
  }
}
