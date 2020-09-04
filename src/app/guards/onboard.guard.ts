import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LocalstorageService } from '../athlete-portal/common-services/localstorage.service';

@Injectable()
export class OnboardGuard implements CanActivate {
  profile;
  constructor(
    private router: Router,
    private localstorageService: LocalstorageService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.profile = this.localstorageService.getAthleteProfileIfExists();
    if (this.profile.onboardingStep && this.profile.onboardingStatus !== 'complete' && this.profile.onboardingStep !== next.routeConfig.path) {
      this.router.navigate([`/${this.profile.onboardingStep}`]);
      return false;
    }
    return true;
  }
}
