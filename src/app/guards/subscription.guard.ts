import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, NavigationExtras } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalstorageService } from "../athlete-portal/common-services/localstorage.service";

@Injectable()
export class SubscriptionGuard implements CanActivate {

  constructor(private router: Router, private localstorageService: LocalstorageService) {

  }


  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    const profile = this.localstorageService.getAthleteProfileIfExists();
    if (profile && (!profile.subscriptionId || +profile.subscriptionDaysRemain < 0)) {
      this.router.navigate(['/user/subscription-options']);

      return false;
    }

    return true;
  }
}
