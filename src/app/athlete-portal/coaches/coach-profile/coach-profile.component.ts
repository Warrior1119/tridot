import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { DashboardServiceService } from '../../common-services/dashboard-service.service'
import { AddTestimonialComponent } from './add-testimonial/add-testimonial.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { CommonUtils } from '../../common-util/common-utils';
import { ConfirmationModalComponent } from '../../common-components/confirmation-modal/confirmation-modal.component';
import { CoachesService } from '../coaches.service';
import { LocalstorageService } from './../../common-services/localstorage.service';

@Component({
  selector: 'app-coach-profile',
  templateUrl: './coach-profile.component.html',
  styleUrls: ['./coach-profile.component.scss']
})
export class CoachProfileComponent implements OnInit {
  coach: any;
  coaches: any;
  testimonials: any;
  sampleTestimonials;
  modalRef: BsModalRef;
  athleteProfile;
  endpoint = environment.API_ENDPOINT;
  public isPremiumAthlete = false;
  public coachId = false;
  public isTestimonialSubmitted = false;
  public coachPics: any;

  constructor(
    private modalService: BsModalService,
    private dashboardService: DashboardServiceService,
    private coachService: CoachesService,
    private router: Router,
    private localstorageService: LocalstorageService,
  ) {}

  ngOnInit() {
    this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
    this.isPremiumAthlete = CommonUtils.isAtleteSubscriptionPremium(this.athleteProfile);
    
    this.router.routerState.root.firstChild.firstChild.queryParams.subscribe(({coachId}) => {
      if (coachId) {
        this._getCoach(coachId);
      } else {
        const profileCoachId = 
             this.athleteProfile 
          && this.athleteProfile.coach
          && this.athleteProfile.coach.coachId;

        if (profileCoachId) {
          this._getCoach(profileCoachId);
        } else {
          this.router.navigate(['/coaches']);
        }
      }
    });
    
  }

  addCoach(coach) {
    this.modalRef = this.modalService.show(ConfirmationModalComponent);
    this.modalRef.content.message = `Are you sure you want to add ${coach.firstName} ${coach.lastName} as your coach?`;
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.confirmation.subscribe((decision) => {
      if (decision === true) {
        this.dashboardService.addCoach(coach.coachId).subscribe(res => {
          if (res.header.status === 'success') {
            console.log(res);
          }
          if (res.header.status === 'error') {
            console.log(res);
          }
        }, (err) => {
          console.log(err);
        });
      }
    });
  }

  getNextCoach() {
    const coach = this.coaches[this.coaches.indexOf(this.coach) + 1];
    this._loadCoachDetails(coach);
  }

  getPreviousCoach() {
    const coach = this.coaches[this.coaches.indexOf(this.coach) - 1];
    this._loadCoachDetails(coach);
  }

  isAddTestimonialAllowed() {
    if (this.athleteProfile && this.athleteProfile.coach) {
      return this.athleteProfile.coach.coachId === this.coach.coachId;
    }
    return false;
  }

  openAddTestimonialModal() {
    this.modalRef = this.modalService.show(AddTestimonialComponent);
    this.modalRef.content.displayModal = this.modalRef;
    this.modalRef.content.testimonial.subscribe((res) => {
      const testimonial = {
        message: res,
        athleteId: this.athleteProfile.athleteId,
        athleteName: this.athleteProfile.firstName + ' ' + this.athleteProfile.lastName,
        athleteLocation: '',
        statusCode: 30,
        sortOrder: '-1',
        coachId: this.coach.coachId,
        coachName: this.coach.firstName
      };
      this._addTestimonial(testimonial);
    });
  }

  setTestimonials() {
    if (this.coach.samples === false) {
      return this.testimonials;
    } else if (this.coach.samples === true) {
      return this.sampleTestimonials;
    }
  }

  private _addTestimonial(testimonial) {
    this.dashboardService.addTestimonial(testimonial).subscribe((res) => {
      this.isTestimonialSubmitted = true;
      this._getTestimonials(this.coach.coachId);
    });
  }

  private _getTestimonials(coachId) {
    this.dashboardService.getCoachTestimonials(coachId).subscribe((res) => {
      if (res.body && res.body.response) {
        const allTestimonials = res.body.response;
        this.testimonials = allTestimonials.filter((testimonial) => {
          return parseInt(testimonial.statusCode, 10) === 10;
        });
        this.sampleTestimonials = this.testimonials ? this.testimonials.slice(0, 3) :  [];
        this.coach.samples = true;
        this.setTestimonials();
      }
    });
  }

  private _loadCoachPics(coachId: number): void {
    this.coachPics = [];
    this.coachService.getCoachPics(coachId).subscribe((res: any) => {
      if (res && res.body) {
        const pics = res.body.response;
        if (pics && pics instanceof Array) {
          this.coachPics = pics.slice(0, 4);
        }
      }
    }, (err) => {
      console.log(err);
    });
  }

  private async _getCoach(coachId) {
    try {
      this.coachId = coachId;
      const res = await this.dashboardService.getCoaches('').toPromise();
      this.coach = res.body.response.find(coach => coach.coachId == coachId) || this.athleteProfile.coach;
      this.coaches = res.body.response;
      if (this.coach) {
        this._getTestimonials(this.coach.coachId);
        this._loadCoachPics(this.coach.coachId);
      }
    } catch (err){
      console.error(err);
    }
  }

  private _loadCoachDetails(coach: any): boolean {
    if (coach) {
      this.coach = coach;
      this._getTestimonials(this.coach.coachId);
      this._loadCoachPics(this.coach.coachId);
      return true;
    } else {
      return false;
    }
  }

}
