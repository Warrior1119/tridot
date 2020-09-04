
import {filter} from 'rxjs/operators';
import { Component, OnInit, ViewEncapsulation, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { SidebarService } from './sidebar.service';
import { UserProfileService } from '../../athlete-portal/user/user-profile/user-profile.service';
import { DEFAULT_PROFILE_PICTURE, SIDEBAR_AUTO_COLLAPSE_WIDTH } from '../../athlete-portal/constants/constants';
import { Animations } from '../../athlete-portal/constants/animations';
import { environment } from '../../../environments/environment';
import { OnboardService } from '../../onboard/onboard.service';
import { getWindowWidth } from '../../utils/browser';
import { Subscription } from 'rxjs';
import { LocalstorageService } from '../../athlete-portal/common-services/localstorage.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('slide', [
      state('up', style({ height: 0 })),
      state('down', style({ height: '*' })),
      transition('up <=> down', animate(200))
    ]),
    Animations.NgIf.ngIfExpandHeight,
    Animations.NgIf.ngIfFadeIn,
    Animations.NgIf.ngIfFadeOut,
  ],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  activeMenuItem: string;
  isHovering = false;
  hasCoach = false;
  subscription: Subscription;

  get swimdot() {
    return JSON.parse(localStorage.athleteProfile).swimdot;
  }

  get bikedot() {
    return JSON.parse(localStorage.athleteProfile).bikedot;
  }

  get rundot() {
    return JSON.parse(localStorage.athleteProfile).rundot;
  }

  constructor(
    private sidebarService: SidebarService,
    private router: Router,
    private userProfileService: UserProfileService,
    private onboardService: OnboardService,
    private localstorageService: LocalstorageService
  ) {}

  async ngOnInit() {
    await this._getProfile();
    this.hasCoach = Boolean(
             this.profile
          && this.profile.coach
          && this.profile.coach.coachId);

    this.onUrl(this.router.url);
    this.subscription = this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(({url}: NavigationEnd) => this.onUrl(url));
  }

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  @HostListener('window:orientationchange', ['$event'])
  onResize() {
    this.sidebarService.toggled = getWindowWidth(window) < SIDEBAR_AUTO_COLLAPSE_WIDTH;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getSideBarState() {
    return this.sidebarService.toggled;
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  onUrl(url: string) {
    if (
         url.startsWith('/season-planner/training-phase/weekly-summary/daily-workout')
      || url.startsWith('/season-planner/training-phase/weekly-summary')
      || url.startsWith('/training-intensities')
      || url.startsWith('/assessments')
    ) {
      this.activeMenuItem = 'train';
    } else if (
         url.endsWith('/season-planner')
      || url.startsWith('/racex')
    ) {
      this.activeMenuItem = 'race';
    } else if (
         url.startsWith('/support')
      || url.startsWith('/coaches')
    ) {
      this.activeMenuItem = 'engage';
    } else if (
         url.startsWith('/swimform')
      || url.startsWith('/user/user-profile/tsp')
      || url.startsWith('/user/user-profile/b2r')
    ) {
      this.activeMenuItem = 'diagnostics';
    }
  }

  toggleActiveMenu(value: string) {
    this.activeMenuItem = this.activeMenuItem === value ? '' : value;
  }

  logout() {
    this.loading = true;
    setTimeout(() => {
      this.router.navigate(['/login']).then(() => this.onboardService.clear());
      this.loading = false;
    }, 2000);
  }

  getState(currentMenu) {

    if (currentMenu.active) {
      return 'down';
    } else {
      return 'up';
    }
  }

  isLinkActive(url: string) {
    const queryParamsIndex = this.router.url.indexOf('?');
    const baseUrl = queryParamsIndex === -1 ? this.router.url : this.router.url.slice(0, queryParamsIndex);
    return baseUrl === url;
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

  public get profile() {
    return this.localstorageService.getAthleteProfileIfExists();
  }

  public get profilePicture() {
    return this._getProfilePicture(this.profile.profileImageSmall)
  }

  public get isCoachAccess(): boolean {
    return this.localstorageService.getIsCoachAccess() === 'true'? true : false;
  }
}
