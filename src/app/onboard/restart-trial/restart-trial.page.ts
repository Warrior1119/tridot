import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from "../../athlete-portal/common-services/authentication.service";
import { LocalstorageService } from '../../athlete-portal/common-services/localstorage.service';
import { UserProfileService } from '../../athlete-portal/user/user-profile/user-profile.service';
import { isiOSApp } from "../../utils/browser";

@Component({
  selector: 'restart-trial',
  templateUrl: './restart-trial.page.html',
  styleUrls: ['./restart-trial.page.scss']
})
export class RestartTrialPage implements OnInit {

  profile: any;
  isBusy: boolean;

  constructor(
    private router: Router,
    private userService: UserProfileService,
    private localStorageService: LocalstorageService,
    private authService: AuthenticationService,
  ) {}

  get username() {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }

  async ngOnInit() {
    if (isiOSApp()) {
      return this.authService.logout();
    }

    this.profile = this.localStorageService.getAthleteProfileIfExists();
    if (!this.profile.eligibleForRestart) {
      this.router.navigate(['/']);
    }
  }

  async onTrialRestart() {
    this.isBusy = true;
    try {
      await this.userService.restartTrial();
      localStorage.testDriveRestarted = true;
      this.router.navigate(['/']);
    } catch (err) {
      console.error('Error while restarting Trial', err);
    } finally {
      this.isBusy = false;
    }
  }
}
