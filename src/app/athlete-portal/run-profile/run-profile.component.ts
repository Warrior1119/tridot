import { Component, OnInit, HostListener } from '@angular/core';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { OnboardService } from '../../onboard/onboard.service';
import { CommonTimeUtils } from '../common-util/common-time-utils';
import { LocalstorageService } from './../common-services/localstorage.service';
import { UserProfileService } from '../user/user-profile/user-profile.service';

@Component({
  selector: 'app-run-profile',
  templateUrl: './run-profile.component.html',
  styleUrls: ['./run-profile.component.scss']
})
export class RunProfileComponent implements OnInit {

  @HostListener('window:beforeunload', ['$event']) onBeforeUnload($event) {
    if (!this.complete) return $event.returnValue = false;
  }
  
  runAgeYears = '';
  runAgeMonths = '';
  runProfileForm;
  runDistanceTimeError;
  runHoursPerWeekError;
  longestRunSessionError;
  loading;
  complete;
  errorMessage;
  profile = {
    runDistance: '5k',
    runDistanceTime: '',
    runHoursPerWeek: '',
    runDurationLongestSession: ''
  } as any;

  athleteProfile: any;

  get swimdot() {
    return this.localstorageService.getAthleteProfileIfExists().swimdot;
  }
  get bikedot() {
    return this.localstorageService.getAthleteProfileIfExists().bikedot;
  }

  constructor(
    fb: FormBuilder, 
    private onboardService: OnboardService,
    private localstorageService: LocalstorageService,
    private userProfileService: UserProfileService,
  ) {
    this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
    this.runProfileForm = fb.group({
      distance: [''],
      time: ['', Validators.compose([Validators.required, Validators.minLength(8), x => this._validateRunDistanceTime(x)])],
      months: ['', Validators.required],
      years: ['', Validators.required],
      hoursPerWeek: ['', Validators.compose([Validators.required, Validators.minLength(8), x => this._validateWeeklyRunHours(x)])],
      longestWeeklySession: ['', Validators.compose([Validators.required, Validators.minLength(8), x => this._validateLongestRunSession(x)])]
    });
  }

  private _validateRunDistanceTime({ value }: AbstractControl) {
    if (!value || !value.split(':')) {
      return;
    }

    if (parseInt(value.split(':')[0]) > 1 || (parseInt(value.split(':')[0]) == 0 && parseInt(value.split(':')[1]) < 12) || (parseInt(value.split(':')[1]) == 12 && parseInt(value.split(':')[2]) < 30) || (parseInt(value.split(':')[0]) == 1 && parseInt(value.split(':')[1]) > 5)
    || (parseInt(value.split(':')[0]) == 1 && parseInt(value.split(':')[1]) == 5 && parseInt(value.split(':')[2]) > 0)) {
      this.runDistanceTimeError = 'Run time must be between 12:30min and 01:05hrs';
      return { 'incorrect': true };
    }
    if (value && value.split(':')[0] > 59 || value.split(':')[1] > 59 || value.split(':')[2] > 59) {
      this.runDistanceTimeError = 'Invalid Format';
      return { 'incorrect': true };
    }

    if (value && value.split(':').length != 3) {
      this.runDistanceTimeError = 'Please verify this field';
      return { 'incorrect': true };
    }
  }

  validateRunAgeYears(runAgeYears) {
    if (runAgeYears){
      if (parseInt(runAgeYears)>59){
        this.runProfileForm.controls.years.setErrors({'incorrect': true});
        return true;
      } else {
        return false;
      }
    }
  }

  private _validateWeeklyRunHours({ value }: AbstractControl) {
    if (!value || !value.split(':')) {
      return;
    }
    if (parseInt(value.split(':')[0]) < 0 || parseInt(value.split(':')[0]) > 10 || (parseInt(value.split(':')[0]) == 10 && (parseInt(value.split(':')[1]) > 0 || parseInt(value.split(':')[2]) > 0))) {
      this.runHoursPerWeekError = 'Run Training Load must be between 0 and 10 hrs';
      return { 'incorrect': true };
    }
    if (parseInt(value.split(':')[0]) > 59 || parseInt(value.split(':')[1]) > 59 || parseInt(value.split(':')[2]) > 59) {
      this.runHoursPerWeekError = 'Invalid Format';
      return { 'incorrect': true };
    }
    if (parseInt(value.split(':').length) != 3) {
      this.runHoursPerWeekError = 'Please verify this field';
      return { 'incorrect': true };
    }
  }

  private _validateLongestRunSession({ value }: AbstractControl) {
    if (!value || !value.split(':')) {
      return;
    }
    if (parseInt(value.split(':')[0]) < 0 || parseInt(value.split(':')[0]) > 2 || (parseInt(value.split(':')[0]) == 2 && (parseInt(value.split(':')[1]) > 0 || parseInt(value.split(':')[2]) > 0))) {
      this.longestRunSessionError = 'Longest run training session must be between 0 and 2 hrs';
      return { 'incorrect': true };
    } else if (parseInt(value.split(':')[0]) > 59 || parseInt(value.split(':')[1]) > 59 || parseInt(value.split(':')[2]) > 59) {
      this.longestRunSessionError = 'Invalid Format';
      return { 'incorrect': true };
    } else if (parseInt(value.split(':').length) != 3) {
      this.longestRunSessionError = 'Please verify this field';
      return { 'incorrect': true };
    }
  }

  validateRunAgeMonths(months) {
    if (months) {
      if (parseInt(months) > 11) {
        this.runProfileForm.controls.months.setErrors({ 'incorrect': true });
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
    profile.runAge = CommonTimeUtils.ageToMonths(this.runAgeYears, this.runAgeMonths);

    this.onboardService.saveRun(profile).subscribe((res) => {
      if (res.header.status == 'error') {
        this.errorMessage = res.body.response.msg;
        this.loading = false;
      } else if (res.header.status == 'success') {
        localStorage.setItem('runOnBoardProfile', JSON.stringify(profile));
        console.log(res);
        setTimeout(()=> {
          this.complete = true;
          window.location.href = window.location.origin + "/swim-profile-2"
          this.loading = false;
        }
         , 2000)
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
    const runOnBoardProfile = localStorage.getItem('runOnBoardProfile');
    this.athleteProfile = await this._getAthleteProfile();
    if (runOnBoardProfile) {
      this.profile = Object.assign(this.profile, JSON.parse(runOnBoardProfile));
      const { years, months } = CommonTimeUtils.monthsToAge(this.profile.runAge);
      this.runAgeYears = years;
      this.runAgeMonths = months;
    } else {
      if (this.athleteProfile.memberSource === 'IRONINDEX') {
        const basicAssessmentDetails = JSON.parse(localStorage.getItem('basicAssessmentDetails'));
        if (basicAssessmentDetails.runTime) {
          this.profile.runDistanceTime = basicAssessmentDetails.runTime;
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
