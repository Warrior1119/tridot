import { Component, OnInit, HostListener } from '@angular/core';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { OnboardService } from '../../onboard/onboard.service';
import { CommonTimeUtils } from '../common-util/common-time-utils';
import { LocalstorageService } from './../common-services/localstorage.service';
import { UserProfileService } from '../user/user-profile/user-profile.service';
import { AssessmentsService } from '../assessments/assessments.service';


@Component({
  selector: 'app-swim-profile-1',
  templateUrl: './swim-profile-1.component.html',
  styleUrls: ['./swim-profile-1.component.scss']
})
export class SwimProfile1Component implements OnInit {

  @HostListener('window:beforeunload', ['$event']) onBeforeUnload($event) {
    if (!this.complete) return $event.returnValue = false;
  }

  swimAgeYears = '';
  swimAgeMonths = '';
  swimprofile1Form;
  swimDistanceTimeError;
  weeklySwimHoursError;
  longestSwimSessionError;
  loading;
  complete;
  errorMessage;
  profile = {
    swimDistance: '',
    swimDistanceTime: '',
    swimHoursPerWeek: '',
    swimDurationLongestSession: ''
  } as any;

  athleteProfile: any;

  constructor(
    fb: FormBuilder,
    private onboardService: OnboardService,
    private localstorageService: LocalstorageService,
    private userProfileService: UserProfileService,
    private assessmentsService: AssessmentsService,
  ) {
    this.swimprofile1Form = fb.group({
      swimDistance: ['', Validators.required],
      swimDistanceTime: ['', Validators.compose([Validators.required, Validators.minLength(5), x => this._validateSwimDistanceTime(x)])],
      swimAgeYears: ['', Validators.required],
      swimAgeMonths: ['', Validators.required],
      weeklySwimHours: ['', Validators.compose([Validators.required, Validators.minLength(8), x => this._validateWeeklySwimHours(x)])],
      longestSwimSession: ['', Validators.compose([Validators.required, Validators.minLength(8), x => this._validateLongestSwimSession(x)])]
    });
  }

  validateSwimAgeYears(swimAgeYears) {
    if (swimAgeYears) {
      if (parseInt(swimAgeYears) > 59) {
        this.swimprofile1Form.controls.swimAgeYears.setErrors({ 'incorrect': true });
        return true;
      } else {
        return false;
      }
    }
  }

  validateSwimAgeMonths(swimAgeMonths) {
    if (swimAgeMonths) {
      if (parseInt(swimAgeMonths) > 11) {
        this.swimprofile1Form.controls.swimAgeMonths.setErrors({ 'incorrect': true });
        return true;
      } else {
        return false;
      }
    }
  }

  private _validateSwimDistanceTime({ value }: AbstractControl) {
    if (!value || !value.split(':').length) {
      return;
    }
    if (!CommonTimeUtils.isTimeValid(value) || !CommonTimeUtils.isTimeInBetween(value, '03:00', '16:30')) {
      this.swimDistanceTimeError = 'Swim time must be between 03:00 min and 16:30 min';
      return { 'incorrect': true };
    }
    if (value.split(':').length !== 2) {
      this.swimDistanceTimeError = 'Please verify this field';
      return { 'incorrect': true };
    }
  }

  private _validateWeeklySwimHours({ value }: AbstractControl) {
    if (!value || !value.split(':').length) {
      return;
    }
    if (parseInt(value.split(':')[0]) > 8 || parseInt(value.split(':')[1]) > 59 || parseInt(value.split(':')[2]) > 59 || ((parseInt(value.split(':')[0]) === 8) && ((parseInt(value.split(':')[1]) > 0) || (parseInt(value.split(':')[2]) > 0)))) {
      this.weeklySwimHoursError = 'Swim Training Load must be between 0 and 8 hrs';
      return { 'incorrect': true };
    }
    if (value.split(':').length !== 3) {
      this.weeklySwimHoursError = 'Please verify this field';
      return { 'incorrect': true };
    }
  }

  private _validateLongestSwimSession({ value }: AbstractControl) {
    if (!value || !value.split(':').length) {
      return;
    }
    if (parseInt(value.split(':')[0]) > 2 || ((parseInt(value.split(':')[0]) === 2) && ((parseInt(value.split(':')[1]) > 0) || (parseInt(value.split(':')[2]) > 0)))) {
      this.longestSwimSessionError = 'Longest weekly session cannot exceed 2 hrs.';
      return { 'incorrect': true };
    }
    if (parseInt(value.split(':')[0]) > 59 || parseInt(value.split(':')[1]) > 59 || parseInt(value.split(':')[2]) > 59) {
      this.longestSwimSessionError = 'Invalid Format';
      return { 'incorrect': true };
    }
    if (value.split(':').length !== 3) {
      this.longestSwimSessionError = 'Please verify this field';
      return { 'incorrect': true };
    }
  }

  continue(profile, isValid) {
    // Late form validation allows the red borders appear around invalid fields.
    if (!isValid) {
      return;
    }
    this.loading = true;
    const originalAthleteProfile = this.localstorageService.getAthleteProfileIfExists();
    profile.email   = originalAthleteProfile.email;
    profile.weight  = originalAthleteProfile.weight;
    profile.swimAge = CommonTimeUtils.ageToMonths(this.swimAgeYears, this.swimAgeMonths);

    this.onboardService.saveSwim(profile).subscribe((res) => {
      if (res.header.status === 'error') {
        this.errorMessage = res.body.response.msg;
        this.loading = false;
      } else if (res.header.status === 'success') {
        localStorage.setItem('swimOnBoardProfile', JSON.stringify(profile));
        console.log(res);
        setTimeout(() => {
          this.complete = true;
          window.location.href = window.location.origin + '/bike-profile';
          this.loading = false;
        }
         , 1000);
      }
    }, (err) => {
      this.loading = false;
      this.errorMessage = err.body.response.msg;

      if (!this.errorMessage) {
        this.errorMessage = 'Sorry, Something Went Wrong';
      }
      console.log(err);
    });
  }

  async ngOnInit() {
    const swimOnBoardProfile = localStorage.getItem('swimOnBoardProfile');
    this.athleteProfile = await this._getAthleteProfile();
    if (swimOnBoardProfile) {
      this.profile = Object.assign(this.profile, JSON.parse(swimOnBoardProfile));
      const { years, months } = CommonTimeUtils.monthsToAge(this.profile.swimAge);
      this.swimAgeYears = years;
      this.swimAgeMonths = months;
    } else {
      if (this.athleteProfile.memberSource === 'IRONINDEX') {
        const basicAssessmentDetails = await this.getBasicAssessmentDetails(this.athleteProfile.athleteId);
        if (basicAssessmentDetails) {
          localStorage.setItem('basicAssessmentDetails', JSON.stringify(basicAssessmentDetails));
          if (basicAssessmentDetails.swimDistance && basicAssessmentDetails.swimTime) {
            this.profile.swimDistanceTime = basicAssessmentDetails.swimTime;
            if (basicAssessmentDetails.swimDistance === 'scy') {
              this.profile.swimDistance = '400 yards';
            } else {
              this.profile.swimDistance = '400 meters';
            }
          }
        }
      } else {
        const boardProfile = this.localstorageService.getOnBoardProfileIfExists();
        if (boardProfile) {
          if (boardProfile.preferredMeasurementSystem === 'standard') {
            this.profile.swimDistance = '400 yards';
          } else {
            this.profile.swimDistance = '400 meters';
          }
        }
      }
    }
  }

  private async _getAthleteProfile() {
    try {
      const res = await this.userProfileService.profile().toPromise();
      return res.body.response.athleteProfile;
    } catch (err) {
      console.error(err);
      return {};
    }
  }

  async getBasicAssessmentDetails(memberId: number) {
    try {
      const res = await this.assessmentsService.getBasicAssessmentDetails(memberId).toPromise();
      console.log(res);
      return res.body.response;
    } catch (err) {
      console.error(err);
      return {};
    }
  }
}
