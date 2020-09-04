
import {fromEvent as observableFromEvent,  Observable } from 'rxjs';

import {map, distinctUntilChanged, debounceTime, tap} from 'rxjs/operators';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ViewEncapsulation,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { headers, validHeaders } from '../../athlete-portal/constants/constants';
import { UserProfileService } from '../../athlete-portal/user/user-profile/user-profile.service';
import { LocalstorageService } from '../../athlete-portal/common-services/localstorage.service';





import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { environment } from '../../../environments/environment';
import { OnboardService } from '../../onboard/onboard.service';
import { CommonUtils } from '../../athlete-portal/common-util/common-utils';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { isiOSApp } from "../../utils/browser";
import { HeaderService } from './header.service';
import { SidebarService } from '../sidebar/sidebar.service';
import { EmailVerificationInlineComponent } from '../../athlete-portal/email-verification-inline/email-verification-inline.component';
import { LocalStorage } from '../../athlete-portal/common-services/local-storage';
import { GlobalService } from '../../athlete-portal/common-services/global.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit, AfterViewInit {
  showSearchBar = true;
  query;
  loading = false;
  selectedMainMenu;
  hoveredMenu;
  selectedSubMenu;
  activeUrl;
  subHeaderDisplay;
  validHeaders = validHeaders;
  headers = headers;
  profilePic =   '../assets/img/svg/icons/profile-icon.svg';
  modalRef: BsModalRef;

  @ViewChild('debounceSearch') text: ElementRef;
  endpoint = environment.API_ENDPOINT;

  @ViewChild(ToastContainerDirective) toastContainer: ToastContainerDirective;

  get isiOSApp() {
    return isiOSApp();
  }

  get profile() {
    return this.localstorageService.getAthleteProfileIfExists();
  }

  setProfilePic() {
    this.profilePic = this.profile.profileImageSmall == null ?
    '../assets/img/svg/icons/profile-icon.svg' :
    (this.endpoint + this.profile.profileImageSmall);
  }

  constructor(
    private localstorageService: LocalstorageService,
    private userProfileService: UserProfileService,
    private onboardService: OnboardService,
    private headerService: HeaderService,
    private router: Router,
    private toastr: ToastrService,
    private sidebarService: SidebarService,
    private modalService: BsModalService,
    private globalService: GlobalService,
  ) {


    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeUrl = event.url;
        const on = this.validHeaders.filter(header => event.url.includes(header));
        if (on.length > 0) {
          this.subHeaderDisplay = true;
          let maxLength = 0;
          for (const menu of this.headers) {
            for (const submenu of menu.subMenu) {
              if (this.activeUrl.includes(submenu.link) && submenu.link.length > maxLength) {
                maxLength = submenu.link.length;
                this.selectedMainMenu = menu.mainMenu;
                this.selectedSubMenu = submenu.name;
                localStorage.setItem('subMenu', submenu.name);
                localStorage.setItem('mainMenu', menu.mainMenu);
                this.hoveredMenu = '';
              }
            }
          }
        } else {
          this.subHeaderDisplay = false;
        }
      }
    });
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  onLogoClick() {
    this.router.navigate(['/']);
  }

  onVerifyEmail() {
    this.modalRef = this.modalService.show(EmailVerificationInlineComponent, { backdrop: true });
    this.modalRef.content.displayModal = this.modalRef;
  }

  ngOnInit() {
    if (localStorage.subMenu) {
      this.selectedSubMenu = localStorage.subMenu;
    }
    if (localStorage.mainMenu) {
      this.selectedMainMenu = localStorage.mainMenu;
    }

    this.headerService.coachMenuTitle.subscribe(updatedCoachMenu => {
      this.headers[2].subMenu[2].name = updatedCoachMenu[0];
      this.headers[2].subMenu[2].link = updatedCoachMenu[1];
    });

    if (this.localstorageService.hasUserSignedIn()) {
      // this.profile = this.localstorageService.getAthleteProfileIfExists();
      this.setProfilePic();
      if (localStorage.athleteProfile) {
        const athleteProfile = this.localstorageService.getAthleteProfileIfExists();;
        const coachId = CommonUtils.getAtleteAssignedCoachId(athleteProfile);
        if (coachId && coachId !== -1) {
          this.headerService.updateCoachMenuAsMyCoach();
        } else {
          this.headerService.updateCoachMenuAsCoaches();
        }
      }
    } else {
      this.router.navigate(['/login']);
    }
    this.toastr.overlayContainer = this.toastContainer;
  }

  switchUX() {
    this.loading = true;
    this.userProfileService.updateUXPreference().subscribe((res) => {
      const switchURL = window.location.protocol + '//' + this.profile.nextVersionUrl + '/';
      const url = switchURL + '?' + 'access_token=' + localStorage.accessToken;
      this.onboardService.clear();
      window.open(url, '_self');
    }, (err) => {
      this.loading = false;
      console.log(err);
    });
  }

  search(query) {
    this.router.navigate(['/support'], { queryParams: { query: query } });
  }

  updateHeader(link, subMenu, mainMenu) {
    this.router.navigate([link]);
    this.selectedMainMenu = mainMenu;
    this.selectedSubMenu = subMenu;
    localStorage.setItem('subMenu', subMenu);
    localStorage.setItem('mainMenu', mainMenu);
    this.hoveredMenu = '';
  }

  ngAfterViewInit() {
    if (this.text) {
      observableFromEvent(this.text.nativeElement, 'keyup').pipe(
      tap(() => console.log('keyup')),
      debounceTime(1000),
      distinctUntilChanged(),
      map(() => this.search(this.query)),)
      .subscribe(res => console.log(res));
    }
  }

  public returnToCoachPortal() {
    localStorage.removeItem('accessToken');
    localStorage.athleteProfile = '{}';
    localStorage.removeItem('isCoachAccess');
    localStorage.userType = 'coach';
    this.router.navigate(['/coach']);
    this.globalService.triggerChangeLayout();
  }

  public logout() {
    this.loading = true;
    setTimeout(() => {
      this.router.navigate(['/login']).then(() => this.onboardService.clear());
      this.loading = false;
    }, 2000);
  }

  public get isCoachLogin(): boolean {
    return this.localstorageService.isCoachLogin();
  }

  public get isCoachAccess(): boolean {
    return this.localstorageService.getIsCoachAccess() === 'true';
  }

}
