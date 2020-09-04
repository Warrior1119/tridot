import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '../user-profile.service';
import { getWindowWidth } from '../../../../utils/browser';
import { MOBILE_WIDTH_THRESHOLD, TABLET_WIDTH_THRESHOLD } from '../../../constants/constants';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit {

  profile;

  constructor(private userProfileService: UserProfileService) { }

  async ngOnInit() {
    this.profile = (await this.userProfileService.profile().toPromise()).body.response.athleteProfile;
  }

  get isMobile() {
    return getWindowWidth(window) < MOBILE_WIDTH_THRESHOLD;
  }

  get isMobileOrTablet() {
    return getWindowWidth(window) < TABLET_WIDTH_THRESHOLD;
  }

}
