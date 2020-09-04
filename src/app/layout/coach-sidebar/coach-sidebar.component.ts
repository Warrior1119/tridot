import { Component, OnInit, ViewEncapsulation, OnDestroy, HostListener } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Router } from "@angular/router";
import { DEFAULT_PROFILE_PICTURE, SIDEBAR_AUTO_COLLAPSE_WIDTH } from '../../athlete-portal/constants/constants';
import { Animations } from '../../athlete-portal/constants/animations';
import { environment } from '../../../environments/environment';
import { OnboardService } from "../../onboard/onboard.service";
import { getWindowWidth } from '../../utils/browser';
import { SidebarService } from '../sidebar/sidebar.service';
import { LocalstorageService } from '../../athlete-portal/common-services/localstorage.service';

@Component({
  selector: 'app-coach-sidebar',
  templateUrl: './coach-sidebar.component.html',
  styleUrls: ['./../sidebar/sidebar.component.scss'],
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
export class CoachSidebarComponent implements OnInit {
  activeMenuItem: string = 'athletes';
  isHovering = false;
  loading = false;

  public get profile() {
    return this.localstorageService.getCoachProfileIfExists();
  }

  public get profilePicture() {
    return this._getCoachProfilePicture(this.profile.profilePhotoSmall);
  }

  constructor(
    private sidebarService: SidebarService,
    private localstorageService: LocalstorageService,
    private router: Router,
    private onboardService: OnboardService,
  ) {}

  ngOnInit() {
    this.onUrl(this.router.url);
  }

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  @HostListener('window:orientationchange', ['$event'])
  onResize() {
    this.sidebarService.toggled = getWindowWidth(window) < SIDEBAR_AUTO_COLLAPSE_WIDTH;
  }

  getSideBarState() {
    return this.sidebarService.toggled;
  }

  toggleSidebar() {
    this.sidebarService.toggle();
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

  onUrl(url: string) {
    if (url.endsWith('/coachProfile')) {
      this.activeMenuItem = 'my-profile';
    } else if (url.endsWith('/coachAthletes')) {
      this.activeMenuItem = 'athletes';
    }
  }

  changeActiveUrl(active: string) {
    this.activeMenuItem = active;
  }

  private _getCoachProfilePicture(profilePicture: string) {
    return profilePicture ? `${environment.API_ENDPOINT}${profilePicture}` : DEFAULT_PROFILE_PICTURE;
  }
}
