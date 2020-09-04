import { Component } from '@angular/core';
import { UserProfileService } from '../user-profile.service';
import { LocalstorageService } from './../../../common-services/localstorage.service';
import { getWindowWidth } from '../../../../utils/browser';
import { MOBILE_WIDTH_THRESHOLD, TABLET_WIDTH_THRESHOLD } from '../../../constants/constants';

@Component({
  selector: 'app-athlete-profile-settings',
  templateUrl: './athlete-profile-settings.component.html',
  styleUrls: ['./athlete-profile-settings.component.scss']
})
export class AthleteProfileSettingsComponent {
  athleteProfile: any;

  constructor(private userProfileService: UserProfileService,
              private localstorageService: LocalstorageService,) { 
    this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
  }

  public save(profile): void {
    this.userProfileService.saveProfile(profile).subscribe((res) => {
      localStorage.athleteProfile = JSON.stringify(profile);
      this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
    });
  }

  get isMobile() {
    return getWindowWidth(window) < MOBILE_WIDTH_THRESHOLD;
  }

  get isMobileOrTablet() {
    return getWindowWidth(window) < TABLET_WIDTH_THRESHOLD;
  }
}
