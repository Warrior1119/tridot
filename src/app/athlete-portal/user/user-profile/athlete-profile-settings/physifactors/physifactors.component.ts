import * as moment from 'moment';

import { Component, OnInit, Input, ChangeDetectorRef, enableProdMode } from '@angular/core';
import { BS_DATEPICKER_DEFAULTS } from '../../../../constants/constants';
import { DATE_PATTERN_MM_DD_YYYY, PLACEHOLDER_MM_DD_YYYY,
         PLACEHOLDER_DD_MM_YYYY, DATE_PATTERN_DD_MM_YYYY,
         MASK_MM_DD_YYYY, MASK_DD_MM_YYYY } from '../../../../constants/date-time.constants';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { UserProfileService } from '../../user-profile.service';
import { CommonUtils } from '../../../../common-util/common-utils';
import { environment } from '../../../../../../environments/environment';
import { DEFAULT_PROFILE_PICTURE } from '../../../../constants/constants';

@Component({
  selector: 'app-physifactors',
  templateUrl: './physifactors.component.html',
  styleUrls: ['./physifactors.component.scss']
})
export class PhysifactorsComponent implements OnInit {
  @Input() profile;
  @Input() isMobile;
  @Input() isMobileOrTablet;

  originalProfile;
  profilePicture;
  profilePayload = new FormData();
  
  bsConfig: Partial<BsDatepickerConfig> = Object.assign({}, BS_DATEPICKER_DEFAULTS);
  maxDate = new Date();
  heightError;
  weightError;
  raceWeightError;
  ageError;
  armSpanError;
  height: string;
  armSpan: string;
  heightMask: string;
  afterDOBChange = false;
  afterHeightChange = false;
  afterWeightChange = false;
  afterRaceWeightChange = false;
  afterArmSpanChange = false;
  ageFormatError = false;
  prevMeasurementSystem: string;
  orgHeight: string;
  orgArmSpan: string;
  orgWeight;
  orgTypicalRaceWeight;
  dobFormatIntl = false;

  heightPattern = '^[0-9]+\.[ ]?([0-9]{1,2}[\']?|)$';

  placeholders = {
    dob: {
      unselect: 'Date Of Birth',
      current: 'Date Of Birth'
    },
    weight: {
      unselect: 'Weight',
      current: 'Weight',
    },
    height: {
      unselect: 'Height',
      current: 'Height',
    }
  };

  masks = {
    height: {
      standard: '0\'00\"',
      metric: '000',
    }
  };

  public isEditMode = false;
  public loading = false;

  get dobPlaceholder() {
    return this.dobFormatIntl ? PLACEHOLDER_DD_MM_YYYY : PLACEHOLDER_MM_DD_YYYY;
  }

  get dobInputMask() {
    return this.dobFormatIntl ? MASK_DD_MM_YYYY : MASK_MM_DD_YYYY;
  }

  get dobPattern() {
    return this.dobFormatIntl ? DATE_PATTERN_DD_MM_YYYY : DATE_PATTERN_MM_DD_YYYY;
  }

  constructor(
    private userProfileService: UserProfileService,
    ) { }

  public saveProfile(profile): void {
    this.userProfileService.saveProfile(profile).subscribe((res) => {
      localStorage.athleteProfile = JSON.stringify(profile);
      this.profile = JSON.parse(localStorage.athleteProfile);
      this.setProfileHeight();
      this.originalProfile = Object.assign({}, this.profile);
      this.loading = false;
      this.isEditMode = false;
      this.afterDOBChange = false;
      this.afterHeightChange = false;
      this.afterWeightChange = false;
      this.afterRaceWeightChange = false;
      this.afterArmSpanChange = false;
    });
  }

  async updateProfile(profile) {
    this.loading = true;
    if (profile.measurementSystem === 'standard') {
      profile.height = this._getHeightInInches(this.height);
    } else {
      profile.height = this.height;
    }
    if (profile.measurementSystem === 'standard') {
      profile.armSpan = this._getHeightInInches(this.armSpan);
    } else {
      profile.armSpan = this.armSpan;
    }
    if (this.profile.prefDateFormat || this.dobFormatIntl) {
      profile.prefDateFormat = this.dobPlaceholder;
    }

    // const res = await this.userProfileService.editProfilePicture(this.profilePayload).toPromise();
    // console.log("res...",res);

    this.saveProfile(profile);
  }

  public removeProfileImage() {
    this.profilePicture = "";
    // this.profilePayload.append('file', '');
    // this.saveProfile(this.profile);
  }

  async uploadPicture(event) {
    const file = event.target.files[0];
    const payload = new FormData();
    payload.append('file', file);
    console.log(file);
    const res = await this.userProfileService.editProfilePicture(payload).toPromise();
    if (res && res.header.status === 'success') {
      // reset athlete profile
      this.profile = await this._getProfile(); // do this to reset small & big profile pictures
      console.log(this.profile);
      this.profilePicture = this._getProfilePicture(this.profile.profileImageSmall);
      console.log(this.profilePicture);
    }
  }

  public cancel() {
    this.profile = Object.assign({}, this.originalProfile);
    this.setProfileHeight();
    this.isEditMode = false;
    this.resetFlags();
    console.log("environment.API_ENDPOINT", environment.API_ENDPOINT);
  }

  private resetFlags() {
    this.raceWeightError = null;
    this.weightError = null;
    this.armSpanError = null;
    this.ageError = null;
    this.heightError = null;
    this.afterDOBChange = false;
    this.afterHeightChange = false;
    this.afterWeightChange = false;
    this.afterRaceWeightChange = false;
    this.afterArmSpanChange = false;
  }

  public isSaveDisabled(): boolean {
    return this.loading || this.hasErrors();
  }

  private hasErrors(): boolean {
    return this.ageError || this.heightError
      || this.weightError
      || this.raceWeightError
      || this.armSpanError;
  }

  getDobValue() {
    if (this.profile.dob) {
      return this._formatDate(this.profile.dob);
    } else {
      return '';
    }
  }

  dobChange(input) {
    const date = input.currentTarget.value;
    this.afterDOBChange = true;
    if (date) {
        this.profile.dob = moment(date, this.dobPlaceholder).format(PLACEHOLDER_MM_DD_YYYY);
        this.ageError = this._validateAge(date);
    }
  }

  createRange(number) {
    const items: number[] = [];
    for (let i = 1; i <= number; i++) {
      items.push(i);
    }
    return items;
  }

  getHeightPlaceholder(system: string) {
    if (system === 'standard') {
      return '0\'00"';
    }
    return '000 cms';
  }

  getWeightPlaceholder(system: string) {
    if (system === 'standard') {
      return '000 lbs';
    }
    return '000 kg';
  }

  getHeightPostfix(system: string) {
    if (system === 'standard') {
      return '';
    }
    return 'cms';
  }

  getWeightPostfix(system: string) {
    if (system === 'standard') {
      return 'lbs';
    }
    return 'kg';
  }

  onBlur(metric) {
    if (metric === 'weight') {
      if (!this.profile.weight) {
        this.placeholders.weight.current = this.placeholders.weight.unselect;
      } else {
        this.placeholders.weight.current = '';
      }
    } else {
      if (!this.profile.height) {
        this.placeholders.height.current = this.placeholders.height.unselect;
      } else {
        this.placeholders.height.current = '';
      }
    }
  }

  onFocus(metric) {
    if (metric === 'weight') {
      this.afterWeightChange = false;
      if (!this.profile.weight) {
        this.placeholders.weight.current = this.getWeightPlaceholder(this.profile.measurementSystem);
      } else {
        this.placeholders.weight.current = '';
      }
    } else if (metric === 'height') {
      this.afterHeightChange = false;
      if (!this.profile.height) {
        this.placeholders.height.current = this.getHeightPlaceholder(this.profile.measurementSystem);
      } else {
        this.placeholders.height.current = '';
      }
    }
  }

  getPlaceholder(metric) {
    if (metric === 'weight') {
      if (!this.profile.weight) {
        this.placeholders.weight.current = this.getWeightPlaceholder(this.profile.measurementSystem);
      } else {
        this.placeholders.weight.current = '';
      }
      return this.placeholders.weight.current;
    } else {
      if (!this.profile.height) {
        this.placeholders.height.current = this.getHeightPlaceholder(this.profile.measurementSystem);
      } else {
        this.placeholders.height.current = '';
      }
      return this.placeholders.height.current;
    }
  }

  public validateArmSpan(): void {
    this.afterArmSpanChange = true;
    const value = this.armSpan;
    if (!value) {
      this.armSpanError = 'Please enter your arm span.';
      return;
    }
    if (this.profile.measurementSystem === 'metric') {
      if (parseInt(value, 10) > 213.36 || parseInt(value, 10) < 147.32) {
        this.armSpanError = 'Please enter a arm span between 147 cm and 213 cm';
        return;
      }
    } else {
      if (value.split('\'').length !== 2) {
        this.armSpanError = 'Invalid Format';
        return;
      }
      if (58 > this._getHeightInInches(value) || this._getHeightInInches(value) > 84) {
        this.armSpanError = 'Please enter a arm span between 4\'10" and 7\'0"';
        return;
      }
    }
    this.armSpanError = null;
    const arrValues = value.split('\'');
    this.armSpan = arrValues && arrValues[1] && arrValues[1].length === 1 ? value.split('\'')[0] + '\'0' + value.split('\'')[1] : value;
    if (this.profile.measurementSystem == 'metric')
      this.orgArmSpan = value;
    else
      this.orgArmSpan = this._getHeightInInches(value).toString();
    return;
  }

  public validateHeight(): void {
    const value = this.height;
    if (!value) {
      this.heightError = 'Please enter your height.';
      return;
    }
    if (this.profile.measurementSystem === 'metric') {
      if (parseInt(value, 10) > 213.36 || parseInt(value, 10) < 147.32) {
        this.heightError = 'Please enter a height between 147 cm and 213 cm';
        return;
      }
    } else {
      if (value.split('\'').length !== 2) {
        this.heightError = 'Invalid Format';
        return;
      }
      if (58 > this._getHeightInInches(value) || this._getHeightInInches(value) > 84) {
        this.heightError = 'Please enter a height between 4\'10" and 7\'0"';
        return;
      }
    }
    this.heightError = null;
    const arrValues = value.split('\'');
    this.height = arrValues && arrValues[1] && arrValues[1].length === 1 ? value.split('\'')[0] + '\'0' + value.split('\'')[1] : value;
    if (this.profile.measurementSystem == 'metric')
      this.orgHeight = value;
    else
      this.orgHeight = this._getHeightInInches(value).toString();
    return;
  }

  validateRaceWeight() {
    this.afterRaceWeightChange = true;
    this.raceWeightError = CommonUtils.validateWieght(this.profile.measurementSystem,
                                                this.profile.typicalRaceWeigth, 'typical race weight');
    this.orgTypicalRaceWeight = this.profile.typicalRaceWeigth;
    return;
  }

  validateWeight() {
    this.afterWeightChange = true;
    this.weightError = CommonUtils.validateWieght(this.profile.measurementSystem, this.profile.weight);
    this.orgWeight = this.profile.weight;
    return;
  }

  ngOnInit() {
    this.profile.weight = Math.round(this.profile.weight);
    this.profile.typicalRaceWeigth = Math.round(this.profile.typicalRaceWeigth);
    this.originalProfile = Object.assign({}, this.profile);
    this.heightMask = this.getHeightMask();
    this.setProfileHeight();
    this.orgHeight = this.profile.height;
    this.orgArmSpan = this.profile.armSpan;
    this.orgWeight = this.profile.weight;
    this.orgTypicalRaceWeight = this.profile.typicalRaceWeigth;
    if (this.profile.prefDateFormat && this.profile.prefDateFormat === PLACEHOLDER_DD_MM_YYYY) {
      this.dobFormatIntl = true;
    }
    this.profilePicture = this._getProfilePicture(this.profile.profileImageSmall);
  }

  private setProfileHeight(): void {
    if (this.profile.measurementSystem === 'standard') {
      this.height = this._getHeightInFeetInches(this.profile.height);
    } else {
      this.height = this.profile.height;
    }
    if (this.profile.measurementSystem === 'standard') {
      this.armSpan = this._getHeightInFeetInches(this.profile.armSpan);
    } else {
      this.armSpan = this.profile.armSpan;
    }
  }

  public getHeightMask() {
    if (this.profile.measurementSystem === 'standard') {
      return '0\'00"';
    } else {
      return '000';
    }
  }

  private _getHeightInFeetInches(inches: number) {
    return inches && `${Math.floor(inches / 12)}'${inches % 12 < 10 ? '0' : ''}${inches % 12}"`;
  }

  private _getHeightInInches(feetAndInches: string) {
    return 12 * parseInt(feetAndInches.split('\'')[0], 10) + parseInt(feetAndInches.split('\'')[1], 10);
  }

  private _formatDate(date) {
    if (!date) {
      return '';
    }
    return moment(date).format(this.dobPlaceholder);
  }

  public setMeasurementUnit(unit) {
    if (this.isEditMode) {
      this.prevMeasurementSystem = this.profile.measurementSystem;
      this.profile.measurementSystem = unit;
      this.updateProfileOnMeasurementChange(this.profile);
    }
  }

  private updateProfileOnMeasurementChange(profile: any): void {
    if (profile.measurementSystem === this.prevMeasurementSystem) {
      return;
    }

    profile.height = this.orgHeight;
    profile.armSpan = this.orgArmSpan;
    profile.weight = this.orgWeight;
    profile.typicalRaceWeigth = this.orgTypicalRaceWeight;
    if (profile.measurementSystem === 'metric') {
      if (profile.height) {
        const height = parseFloat(profile.height) * 2.54;
        this.orgHeight = height.toString();
        profile.height = height.toFixed(1);
        profile.height = (Math.round(profile.height * 2) / 2).toFixed(1);
      }
      if (profile.armSpan) {
        const armSpan = parseFloat(profile.armSpan) * 2.54;
        this.orgArmSpan = armSpan.toString();
        profile.armSpan = armSpan.toFixed(1);
        profile.armSpan = (Math.round(profile.armSpan * 2) / 2).toFixed(1);
      }
      if (profile.weight) {
        const weight = profile.weight * 0.45359237;
        this.orgWeight = weight;
        profile.weight = Math.round(weight);
      }
      if (profile.typicalRaceWeigth) {
        const typicalRaceWeight = profile.typicalRaceWeigth * 0.45359237;
        this.orgTypicalRaceWeight = typicalRaceWeight;
        profile.typicalRaceWeigth = Math.round(typicalRaceWeight);
      }
    } else {
      if (profile.height) {
        const height = parseFloat(profile.height) * (1 / 2.54);
        this.orgHeight = height.toString();
        profile.height = height.toFixed(1);
        profile.height = (Math.round(profile.height * 2) / 2).toFixed(1);
      }
      if (profile.armSpan) {
        const armSpan = parseFloat(profile.armSpan) * (1 / 2.54);
        this.orgArmSpan = armSpan.toString();
        profile.armSpan = armSpan.toFixed(1);
        profile.armSpan = (Math.round(profile.armSpan * 2) / 2).toFixed(1);
      }
      if (profile.weight) {
        const weight = profile.weight / 0.45359237;
        this.orgWeight = weight;
        profile.weight = Math.round(weight);
      }
      if (profile.typicalRaceWeigth) {
        const typicalRaceWeight = profile.typicalRaceWeigth / 0.45359237;
        this.orgTypicalRaceWeight = typicalRaceWeight;
        profile.typicalRaceWeigth = Math.round(typicalRaceWeight);
      }
    }
    this.setProfileHeight();
    setTimeout(()=>{
      this.heightMask = this.getHeightMask();
    }, 10);
  }

  private _validateAge(value) {
    
    if (!value) {
        return 'Please enter your date of birth.';
    }

    if (!this.dobPattern.test(value)) {
      return `Please format date as ${this.dobPlaceholder}.`;
    }
    const dateDOBFormated = moment(value, this.dobPlaceholder);
    if (
      new Date().getFullYear() - dateDOBFormated.year() < 13
      || new Date().getFullYear() - dateDOBFormated.year() > 99
    ) {
        return 'You must be between the ages of 13 and 99 to sign up for TriDot.';
    }

  }

  private async _getProfile() {
    const res = await this.userProfileService.profile().toPromise();
    // this.currentRace = res.body.response.athleteProfile.comingRace;
    return res.body.response.athleteProfile;
  }

  private _getProfilePicture(profilePicture: string) {
    return profilePicture ? `${environment.API_ENDPOINT}${profilePicture}` : DEFAULT_PROFILE_PICTURE;
  }

}
