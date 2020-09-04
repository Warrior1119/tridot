import Debounce from 'debounce-decorator';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { DEFAULT_PROFILE_PICTURE, DEBOUNCE_INTERVAL_DEFAULT_MS } from '../../../athlete-portal/constants/constants';
import { LocalstorageService } from '../../../athlete-portal/common-services/localstorage.service';

@Component({
  selector: 'app-coach-mobile-sidebar',
  templateUrl: './coach-mobile-sidebar.component.html',
})
export class CoachMobileSidebarComponent implements OnInit {
  profilePicture = '';
  profile: any = {};
  query;

  constructor(
    private localstorageService: LocalstorageService,
    private router: Router,
  ) {
  }

  isLinkActive(url) {
    const queryParamsIndex = this.router.url.indexOf('?');
    const baseUrl = queryParamsIndex === -1 ? this.router.url : 
    this.router.url.slice(0, queryParamsIndex);
    return baseUrl === url;
 }

  async ngOnInit() {
    window['initSlideBars']();
    this.profile = this.localstorageService.getCoachProfileIfExists();
    this.profilePicture = this._getProfilePicture(this.profile.profileImageLarge);
  }

  private _getProfilePicture(profilePicture: string) {
    return profilePicture ? `${environment.API_ENDPOINT}${profilePicture}` : DEFAULT_PROFILE_PICTURE;
  }

  @Debounce(2 * DEBOUNCE_INTERVAL_DEFAULT_MS)
  search() {
    window.location.href = '/support?query=' + this.query;
  }
}  