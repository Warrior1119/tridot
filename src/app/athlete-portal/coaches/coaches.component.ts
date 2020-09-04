import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { DashboardServiceService } from '../common-services/dashboard-service.service';
import { ConfirmationModalComponent } from '../common-components/confirmation-modal/confirmation-modal.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { CommonUtils } from '../common-util/common-utils';
import { HeaderService } from '../../layout/header/header.service';
import { LocalstorageService } from './../common-services/localstorage.service';

@Component({
  selector: 'app-coaches',
  templateUrl: './coaches.component.html',
  styleUrls: ['./coaches.component.scss']
})
export class CoachesComponent implements OnInit {
  coaches: any;
  loading = false;
  errorMessage;
  rowData = [];
  endpoint = environment.API_ENDPOINT;
  athleteProfile;
  filterNames = {
    gender: '',
    atheleteFocus: '',
    formatFocus: '',
    disciplineFocus: '',
    yearsExp: ''
  }

  originalCoaches = [];
  modalRef: BsModalRef;

  filterBy = {
    name: '',
    gender: '',
    coachFocus: '',
    formatFocus: '',
    swimFocus: '',
    beginnerFocus: '',
    clydesdalesFocus: '',
    sprintFocus: '',
    intermediateFocus: '',
    highlyCompetitiveFocus: '',
    eliteFocus: '',
    olympicFocus: '',
    halfMarathonFocus: '',
    fullMarathonFocus: '',
    bikeFocus: '',
    runFocus: '',
    nutritionFocus: ''
  }

  public coachNameFilter = '';

  constructor(private modalService: BsModalService,
              private dashboardService: DashboardServiceService,
              private headerService: HeaderService,
              private router: Router,
              private localstorageService: LocalstorageService) {

  }

  updateDisplay(key, value) {
    this.filterNames[key] = value;
  }

  filter(key, value, displayKey, displayValue) {
    this.filterBy[key] = value;

    this.updateDisplay(displayKey, displayValue);

    if (this.coaches.length === 0) {
      this.coaches = this.originalCoaches;
    }
    this.filterCoaches();
  }

  public filterByName(): void {
    const searchFilter = this.coachNameFilter;
    if (!searchFilter || searchFilter.trim() === '' ) {
      this.filterBy.name = '';
    } else {
      this.filterBy.name = searchFilter;
    }
    this.filterCoaches();
  }

  private filterCoaches(): void {
    Object.keys(this.filterBy).forEach(key => {
      if (key === 'name') {
        this.coaches = this.originalCoaches.filter(coach => {
          const fullName = this.toLowerCase(coach.firstName) + ' ' + this.toLowerCase(coach.lastName);
          return fullName.indexOf(this.filterBy[key].toLowerCase()) !== -1;
        });
      } else if (this.filterBy[key]) {
        this.coaches = this.coaches.filter(coach => coach[key] === this.filterBy[key])
      }
    });
  }

  private toLowerCase(value: string): string {
    if (value) {
      return value.toLowerCase();
    } else {
      return '';
    }
  }

  public addCoach(coach): void {
    this.modalRef = this.modalService.show(ConfirmationModalComponent);
    if (CommonUtils.isAtleteSubscriptionPremium(this.athleteProfile)) {
      this.modalRef.content.message = 'Are you sure you want to add ' + coach.firstName + ' ' + coach.lastName + ' as your coach?';
      this.modalRef.content.displayModal = this.modalRef;

      this.modalRef.content.confirmation.subscribe((decision) => {
        if (decision === true) {
         this.saveAssignCoach(coach);
        }
      });
    } else {
      this.modalRef.content.message = 'Adding Coach requires Premium Subscription.';
      this.modalRef.content.successBtnTxt = 'UPGRADE ACCOUNT';
      this.modalRef.content.modalTitle = 'Upgrade Account';
      this.modalRef.content.displayModal = this.modalRef;

      this.modalRef.content.confirmation.subscribe((decision) => {
        if (decision === true) {
          this.router.navigate(['/user/subscription-options']);
        }
      });
    }
  }

  private saveAssignCoach(coach): void {
    this.loading = true;
    this.dashboardService.addCoach(coach.coachId).subscribe(res => {
      if (res.header.status === 'success') {
        this.headerService.updateCoachMenuAsMyCoach();
        this.router.navigate(['/coaches/coach-profile'], { queryParams: {coachId: coach.coachId} });
        this.loading = false;
      }
      if (res.header.status === 'error') {
        console.log(res);
        this.loading = false;
        this.errorMessage = 'Unable to assign coach. Please contact support.';
      }
    }, (err) => {
      console.log(err);
      this.loading = false;
      this.errorMessage = 'Unable to assign coach. Please contact support.';
    });
  }

  reset() {
    this.filterNames = {
      gender: '',
      atheleteFocus: '',
      formatFocus: '',
      disciplineFocus: '',
      yearsExp: ''
    }
    this.getCoaches();
    this.coachNameFilter = '';
  }

  getCoaches() {
    this.dashboardService.getCoaches('').subscribe((res) => {
      console.log(res);
      this.coaches = res.body.response;
      this.originalCoaches = this.coaches;
    }, (err) => {
      console.log(err);
    })
  }

  ngOnInit() {
    this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();

    const hasCoach = Boolean(
             this.athleteProfile 
          && this.athleteProfile.coach
          && this.athleteProfile.coach.coachId);

    if (hasCoach) {
      this.router.navigate(['/coaches/coach-profile'])
    } else {
      this.getCoaches();
    }
  }

}
