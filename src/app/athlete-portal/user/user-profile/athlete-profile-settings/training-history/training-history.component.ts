import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from "@angular/forms";
import * as moment from 'moment';
import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { DATE_PATTERN_MM_DD_YYYY, PLACEHOLDER_DD_MM_YYYY, DEFAULT_PREF_DATE_PATTERN, DATE_PATTERN_DD_MM_YYYY } from '../../../../constants/date-time.constants';
import { UserProfileService } from '../../user-profile.service';
import { RACEX_DIVISION } from '../../../../constants/constants';

@Component({
  selector: 'app-training-history',
  templateUrl: './training-history.component.html',
  styleUrls: ['./training-history.component.scss']
})
export class TrainingHistoryComponent implements OnInit {

  @Input() profile;
  @Input() isMobile;
  @Input() isMobileOrTablet;
  @Output() save = new EventEmitter();

  @ViewChild('f') public form: NgForm;

  originalProfile;
  swimStartDate: string;
  runStartDate: string
  bikeStartDate: string
  loading = false;
  isEditMode = false;
  racex_division = RACEX_DIVISION;


  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
  ) {}

  update(profile) {
    this.save.next(profile);
  }

  get savingProfile() {
    return this.userProfileService.savingProfile;
  }

  get prefDateFormat() {
    return this.profile && this.profile.prefDateFormat || DEFAULT_PREF_DATE_PATTERN;
  }

  get dobPattern() {
    return this.profile && this.profile.prefDateFormat === PLACEHOLDER_DD_MM_YYYY
      ? DATE_PATTERN_DD_MM_YYYY
      : DATE_PATTERN_MM_DD_YYYY;
  }

  get prefDateMask() {
    return this.profile && this.profile.prefDateFormat === PLACEHOLDER_DD_MM_YYYY
      ? 'd0/m0/0000'
      : 'm0/d0/0000';
  }

  formatDate(input) {
    return moment(input).format(this.prefDateFormat);
  }

  saveProfile(profile) {
    this.userProfileService.saveProfile(profile).subscribe(() => {
      localStorage.athleteProfile = JSON.stringify(profile);
      this.profile = JSON.parse(localStorage.athleteProfile);
      this.originalProfile = Object.assign({}, this.profile);
      this._setStartDates();
      this.loading = false;
      this.isEditMode = false;
    });
  }

  updateProfile() {
    if (this.form.valid) {
      this.loading = true;

      const profile = Object.assign({}, this.profile);
      profile.swimStartDate = moment(this.swimStartDate, this.prefDateFormat).toDate();
      profile.bikeStartDate = moment(this.bikeStartDate, this.prefDateFormat).toDate();
      profile.runStartDate = moment(this.runStartDate, this.prefDateFormat).toDate();

      const now = moment();
      profile.swimAge = Math.floor(moment.duration(now.diff(moment(profile.swimStartDate))).asYears());
      profile.bikeAge = Math.floor(moment.duration(now.diff(moment(profile.bikeStartDate))).asYears());
      profile.runAge = Math.floor(moment.duration(now.diff(moment(profile.runStartDate))).asYears());
      this.saveProfile(profile);
    }
  }

  cancel() {
    this.profile = Object.assign({}, this.originalProfile);
    this.form.reset({
      bikeStartDate: this.formatDate(this.profile.bikeStartDate),
      runStartDate: this.formatDate(this.profile.runStartDate),
      swimStartDate: this.formatDate(this.profile.swimStartDate),
    });
    this._setStartDates();

    this.isEditMode = false;
  }

  ngOnInit() {
    if (this.profile) {
      this.originalProfile = Object.assign({}, this.profile);
      this._setStartDates();
    }
  }

  isSaveDisabled() {
    return this.loading;
  }

  getActiveRaceDivision() {
    if (!this.profile) {
      return;
    }
    const found = RACEX_DIVISION.find(x => x.value == this.profile.raceDivision);
    return found && found.name;
  }

  distanceName(id, name) {
    this.profile.primaryDistance = id;
    this.profile.primaryDistanceName = name;
  }

  private _setStartDates() {
    this.swimStartDate = this.formatDate(this.profile.swimStartDate);
    this.bikeStartDate = this.formatDate(this.profile.bikeStartDate);
    this.runStartDate = this.formatDate(this.profile.runStartDate);
  }

}
