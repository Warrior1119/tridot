import { Component, OnInit, Input } from '@angular/core';
import {UserProfileService} from '../../user-profile.service';
import * as moment from 'moment';

@Component({
  selector: 'app-training-preferences',
  templateUrl: './training-preferences.component.html',
  styleUrls: ['./training-preferences.component.scss']
})
export class TrainingPreferencesComponent implements OnInit {
  @Input() isMobile;
  @Input() isMobileOrTablet;
  
  public profile;
  public editing = false;
  public error = '';
  public loading = false;

  private originalProfile;
  private measurementSystem: string;

  public WEEK_DAYS = [
    {'key' : 'none', 'value': 'None'},
    {'key' : 'mon', 'value': 'Monday'},
    {'key' : 'tue', 'value': 'Tuesday'},
    {'key' : 'wed', 'value': 'Wednesday'},
    {'key' : 'thu', 'value': 'Thursday'},
    {'key' : 'fri', 'value': 'Friday'},
    {'key' : 'sat', 'value': 'Saturday'},
    {'key' : 'sun', 'value': 'Sunday'},
  ];

  constructor(private userProfileService: UserProfileService) { }

  private getProfile(): void {
    this.userProfileService.profile().subscribe((res) => {
      this.profile            = res.body.response.athleteProfile;
      this.originalProfile    = Object.assign({}, this.profile);
      this.measurementSystem  = this.profile.measurementSystem;
    });
  }

  public save(update): void {
    if (!this.editing) {
      this.editing = true;
      return;
    }
    this.loading = true;
    const profile = Object.assign({}, update);
    if (profile.swimStartDate) {
      profile.swimStartDate = moment(profile.swimStartDate).format('l');
    }
    if (profile.runStartDate) {
      profile.runStartDate = moment(profile.runStartDate).format('l');
    }
    if (profile.dob) {
      profile.dob = moment(profile.dob).format('l');
    }
    if (profile.bikeStartDate) {
      profile.bikeStartDate = moment(profile.bikeStartDate).format('l');
    }

    if (profile.dayOff === profile.bikeLongSessionDay && profile.dayOff === profile.runLongSessionDay) {
      this.error = 'Day Off, Long Bike, and Long Run cannot be on the same day.';
    } else if (profile.dayOff === profile.bikeLongSessionDay) {
      this.error = 'Day Off and Long Bike cannot be on the same day.';
    } else if (profile.dayOff === profile.runLongSessionDay) {
      this.error = 'Day Off and Long Run cannot be on the same day.';
    } else if (profile.bikeLongSessionDay === profile.runLongSessionDay) {
      this.error = 'Long Bike and Long Run cannot be on the same day.';
    } else {
      this.error = '';
    }

    if (!this.error) {
      this.userProfileService.save(profile).subscribe((res) => {
        this.measurementSystem = profile.measurementSystem;
        localStorage.athleteProfile = JSON.stringify(profile);
        this.originalProfile = Object.assign({}, profile);
        this.editing = false;
        this.loading = false;
      });
    } else {
      this.loading = false;
    }
  }

  public ngOnInit(): void {
    this.getProfile();
  }

  public cancel(): void {
    this.profile = Object.assign({}, this.originalProfile);
    this.editing = false;
    this.error = '';
  }

  public getWeekDay(key: string): string {
    return this.WEEK_DAYS.find((val) => {
        return key === val.key;
    }).value;
  }

  public setPhaseTrainingPreferences(val: string): void {
    if (!this.editing) {
      return;
    }
    this.profile.phaseTrainingPreferences = val;
  }

}
