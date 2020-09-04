import { Component, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { LocalstorageService } from '../../../athlete-portal/common-services/localstorage.service';
import { Router } from '@angular/router';
import { MOBILE_WIDTH_THRESHOLD } from "../../../athlete-portal/constants/constants";
import { OnboardService } from '../../../onboard/onboard.service';
import { CommonUtils } from '../../../athlete-portal/common-util/common-utils';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { getWindowWidth } from "../../../utils/browser";
import { CoachAthletePreviewPanelComponent } from "../athlete-preview-panel/coach-athlete-preview-panel.component";
import { GlobalService } from '../../../athlete-portal/common-services/global.service';
import { CoachPortalService } from '../../coach-portal.service';

@Component({
    selector: 'app-coach-athlete-row',
    templateUrl: './coach-athlete-row.component.html',
    styleUrls: ['./../coach-athletes.component.scss'],
})
export class CoachAthleteRowComponent {
  @Input() athleteDetails;
  public userDashboardLoading: boolean = false;
  public toggleNotificationsLoading: boolean = false;
  private modalRef: BsModalRef;

  constructor(private localstorageService: LocalstorageService,
              private router: Router,
              private onboardService: OnboardService,
              private modalService: BsModalService,
              private globalService: GlobalService, 
              private coachPortalService: CoachPortalService) {}

  get athletePhotoThumbnail(): string {
    if (this.athleteDetails.photoThumbnail) {
      return environment.API_ENDPOINT + this.athleteDetails.photoThumbnail;
    } else if(this.athleteDetails.gender.toLowerCase() === 'f' || this.athleteDetails.gender.toLowerCase() === 'female') {
      return '../assets/img/female-avatar.png';
    } else {
      return '../assets/img/male-avatar.png';
    }
  }

  get assignmentStatusStyle(): string {
    if(this.athleteDetails.assignmentStatus === 'Assigned to Seat') {
      return "active";
    } else if(this.athleteDetails.assignmentStatus === 'Linked to Coach') {
      return "inactive";
    }
    return "";
  }

  async navigateToAtheleteDashboard(): Promise<void> {
    this.userDashboardLoading = true;
    let res = await this.onboardService.coachAthleteLogin(this.athleteDetails.athleteId, this.localstorageService.getCoachAccessToken())
    if (res.header.status === 'error') {
      this.userDashboardLoading = false;
      CommonUtils.defaultErrorModalMessage(this.modalService);
    } else if (res.header.status === 'success') {
        localStorage.accessToken = res.header.accessToken;
        localStorage.athleteProfile = JSON.stringify(res.body.response);
        localStorage.isCoachAccess = 'true';
        localStorage.userType = 'athlete';
        const today = new Date();
        this.router.navigate(['/season-planner/training-phase/weekly-summary/daily-workout'], { 
          queryParams: 
          { day: (today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear() },
          replaceUrl: true });
        this.globalService.triggerChangeLayout();  
    }
  }

  get isMobile() {
    return getWindowWidth(window) < MOBILE_WIDTH_THRESHOLD;
  }

  openModal() {
    if (this.isMobile) {
      this.modalRef = this.modalService.show(CoachAthletePreviewPanelComponent, { class: 'athlete-preview' });
      this.modalRef.content.displayModal = this.modalRef;
      this.modalRef.content.athleteDetails = this.athleteDetails;
    }
  }

  public async toggleNotifications(): Promise<void> {
    this.toggleNotificationsLoading = true;
    try {
      this.athleteDetails.activityEmails = !this.athleteDetails.activityEmails;
      const coachProfile = this.localstorageService.getCoachProfileIfExists();
      await this.coachPortalService.toggleActivityEmail(coachProfile.coachId, 
                  this.athleteDetails.athleteId, this.athleteDetails.activityEmails).toPromise();  
    } catch (error) {
      CommonUtils.defaultErrorModalMessage(this.modalService);      
    } finally {
      this.toggleNotificationsLoading = false;
    }
  }
}
