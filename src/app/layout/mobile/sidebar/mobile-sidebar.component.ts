import Debounce from 'debounce-decorator';
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { athleteProfileSidebarHeader, DEFAULT_PROFILE_PICTURE, DEBOUNCE_INTERVAL_DEFAULT_MS } from '../../../athlete-portal/constants/constants';
import { UserProfileService } from '../../../athlete-portal/user/user-profile/user-profile.service';
import { LocalstorageService } from '../../../athlete-portal/common-services/localstorage.service';

@Component({
  selector: 'app-mobile-sidebar',
  templateUrl: './mobile-sidebar.component.html',
  styleUrls: ['./mobile-sidebar.component.scss']
})
export class MobileSidebarComponent implements OnInit {
  athleteProfile: any = {};
  headers = athleteProfileSidebarHeader;
  query;

  constructor(
    private userProfileService: UserProfileService,
    private localstorageService: LocalstorageService,
    private router: Router,
  ) {
    try {
      this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
    } catch(e) {}
  }

  isLinkActive(url) {
    const queryParamsIndex = this.router.url.indexOf('?');
    const baseUrl = queryParamsIndex === -1 ? this.router.url : 
    this.router.url.slice(0, queryParamsIndex);
    return baseUrl === url;
 }

  async ngOnInit() {
    window['initSlideBars']();
    await this._getProfile();
  }

  async uploadPicture(event) {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    const res = await this.userProfileService.editProfilePicture(formData).toPromise();
    if (res && res.header.status === 'success') {
      // reset athlete profile
      await this._getProfile(); // do this to reset small & big profile pictures
    }
  }

  private async _getProfile() {
    const res = await this.userProfileService.profile().toPromise();
    if (res.header.status === 'success') {
      const profile = res.body.response.athleteProfile;
      localStorage.athleteProfile = JSON.stringify(profile);
      return profile;
    }
    return JSON.parse(localStorage.athleteProfile);
  }

  private _getProfilePicture(profilePicture: string) {
    return profilePicture ? `${environment.API_ENDPOINT}${profilePicture}` : DEFAULT_PROFILE_PICTURE;
  }

  @Debounce(2 * DEBOUNCE_INTERVAL_DEFAULT_MS)
  search() {
    window.location.href = '/support?query=' + this.query;
  }

  public get profile() {
    return this.localstorageService.getAthleteProfileIfExists();
  }

  public get profilePicture() {
    return this._getProfilePicture(this.profile.profileImageSmall)
  }
}
