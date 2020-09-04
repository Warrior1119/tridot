import { Component, OnInit, HostListener } from '@angular/core';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { OnboardService } from '../../onboard/onboard.service';
import { CommonTimeUtils } from '../common-util/common-time-utils';
import { LocalstorageService } from './../common-services/localstorage.service';
import { UserProfileService } from '../user/user-profile/user-profile.service';

@Component({
  selector: 'app-bike-profile',
  templateUrl: './bike-profile.component.html',
  styleUrls: ['./bike-profile.component.scss']
})
export class BikeProfileComponent implements OnInit {

  @HostListener('window:beforeunload', ['$event']) onBeforeUnload($event) {
    if (!this.complete) return $event.returnValue = false;
  }

  bikeAgeYears = '';
  bikeAgeMonths = '';
  bikeProfileForm;
  bikeDistanceTimeError;
  bikeHoursPerWeekError;
  longestBikeSessionError;
  loading;
  complete;
  errorMessage;
  profile = {
    bikeDistance: '',
    bikeDistanceTime: '',
    bikeHoursPerWeek: '',
    bikeDurationLongestSession: ''
  } as any;
  

  public athleteProfile: any;

  get swimdot() {
    return this.localstorageService.getAthleteProfileIfExists().swimdot;
  }

  constructor(
    fb: FormBuilder, 
    private onboardService: OnboardService, 
    private localstorageService: LocalstorageService,
    private userProfileService: UserProfileService,
  ) {
    this.bikeProfileForm = fb.group({
      distance: ['', Validators.required],
      time: ['', Validators.compose([Validators.required, Validators.minLength(8), x => this._validateBikeDistanceTime(x)])],
      months: ['', Validators.required],
      years: ['', Validators.required],
      hoursPerWeek: ['', Validators.compose([Validators.required, Validators.minLength(8), x => this._validateWeeklyBikeHours(x)])],
      longestWeeklySession: ['', Validators.compose([Validators.required, Validators.minLength(8), x => this._validateLongestBikeSession(x)])]
    });
    this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
  }

  private _validateBikeDistanceTime({ value }: AbstractControl) {
    if (!value || !value.split(':')) {
      return;
    }
    if (parseInt(value.split(':')[0]) > 1 || (parseInt(value.split(':')[0]) == 0 && parseInt(value.split(':')[1]) < 28) || (parseInt(value.split(':')[0]) == 0 && parseInt(value.split(':')[1]) == 28 && parseInt(value.split(':')[2]) < 30)
    || (parseInt(value.split(':')[0]) == 1 && parseInt(value.split(':')[1]) > 37) || (parseInt(value.split(':')[0]) == 1 && parseInt(value.split(':')[1]) == 37 && parseInt(value.split(':')[2]) > 0)) {
      this.bikeDistanceTimeError = 'Bike time must be between 28min 30sec and 1hr 37min';
      return { 'incorrect': true };
    }
    if (value && value.split(':')[0] > 59 || value.split(':')[1] > 59 || value.split(':')[2] > 59) {
      this.bikeDistanceTimeError = 'Invalid Format';
      return { 'incorrect': true };
    }
    if (value && value.split(':').length != 3) {
      this.bikeDistanceTimeError = 'Please verify this field';
      return { 'incorrect': true };
    }
  }

  validateBikeAgeYears(bikeAgeYears) {
    if (bikeAgeYears) {
      if (parseInt(bikeAgeYears) > 59) {
        this.bikeProfileForm.controls.years.setErrors({ 'incorrect': true });
        return true
      } else {
        return false
      }
    }
  }

  private _validateWeeklyBikeHours({ value }: AbstractControl) {
    if (!value || !value.split(':')) {
      return;
    }
    if (parseInt(value.split(':')[0]) > 14 || ((parseInt(value.split(':')[0]) == 14) && ((parseInt(value.split(':')[1]) > 0) || (parseInt(value.split(':')[2]) > 0)))) {
      this.bikeHoursPerWeekError = 'Bike Training Load must be between 0 and 14 hrs.';
      return { 'incorrect': true };
    }
    if (value && value.split(':')[0] > 59 || value.split(':')[1] > 59 || value.split(':')[2] > 59) {
      this.bikeHoursPerWeekError = 'Invalid Format';
      return { 'incorrect': true };
    }
    if (value && value.split(':').length != 3) {
      this.bikeHoursPerWeekError = 'Please verify this field';
      return { 'incorrect': true };
    }
  }

  private _validateLongestBikeSession({ value }: AbstractControl) {
    if (!value || !value.split(':')) {
      return;
    }
    if (parseInt(value.split(':')[0]) > 8 || ((parseInt(value.split(':')[0]) == 8) && ((parseInt(value.split(':')[1]) > 0) || (parseInt(value.split(':')[2]) > 0)))) {
      this.longestBikeSessionError = 'Longest weekly session cannot exceed 8 hrs.';
      return { 'incorrect': true };
    }
    if (parseInt(value.split(':')[0]) > 59 || parseInt(value.split(':')[1]) > 59 || parseInt(value.split(':')[2]) > 59) {
      this.longestBikeSessionError = 'Invalid Format';
      return { 'incorrect': true };
    }
  }

  validateBikeAgeMonths(months) {
    if (months) {
      if (parseInt(months) > 11) {
        this.bikeProfileForm.controls.months.setErrors({ 'incorrect': true });
        return true
      } else {
        return false
      }
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
    profile.bikeAge = CommonTimeUtils.ageToMonths(this.bikeAgeYears, this.bikeAgeMonths);

    this.onboardService.saveBike(profile).subscribe((res) => {
      if (res.header.status == 'error') {
        this.errorMessage = res.body.response.msg;
        this.loading = false;
      } else if (res.header.status == 'success') {
        localStorage.setItem('bikeOnBoardProfile', JSON.stringify(profile));
        console.log(res);
        setTimeout(()=> {
          this.complete = true;
          window.location.href = window.location.origin + "/run-profile"
          this.loading = false;
        }
         , 1000)
      }
    }, (err) => {
      this.loading = false;
      this.errorMessage = err.body.response.msg;

      if(!this.errorMessage) {
        this.errorMessage = "Something went wrong. Please try again later.";
      }
      console.log(err);
    })
  }



  async ngOnInit() {
    const bikeOnBoardProfile = localStorage.getItem('bikeOnBoardProfile');
    this.athleteProfile = await this._getAthleteProfile();
    if (bikeOnBoardProfile) {
      this.profile = Object.assign(this.profile, JSON.parse(bikeOnBoardProfile));
      const { years, months } = CommonTimeUtils.monthsToAge(this.profile.bikeAge);
      this.bikeAgeYears = years;
      this.bikeAgeMonths = months;
    } else {
      if (this.athleteProfile.memberSource === 'IRONINDEX') {
        const basicAssessmentDetails = JSON.parse(localStorage.getItem('basicAssessmentDetails'));
        if (basicAssessmentDetails.bikeDistance && basicAssessmentDetails.bikeTime) {
          this.profile.bikeDistanceTime = basicAssessmentDetails.bikeTime;
          if (basicAssessmentDetails.bikeDistance === 'tt_15m') {
            this.profile.bikeDistance = '15 miles';
          } else {
            this.profile.bikeDistance = '25 kilometers';
          }
        }
      } else {
        if (this.athleteProfile.measurementSystem === 'standard') {
          this.profile.bikeDistance = '15 miles';
        } else {
          this.profile.bikeDistance = '25 kilometers';
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

}
