import * as moment from 'moment';
import { Component, OnInit, HostListener } from '@angular/core';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { OnboardService } from '../onboard.service';
import { Router } from '@angular/router';
import {} from 'googlemaps';
import { GeolocationService } from '../../athlete-portal/common-services/geolocation.service';
import { DATE_PATTERN_MM_DD_YYYY, DATE_PATTERN_DD_MM_YYYY,
  PLACEHOLDER_DD_MM_YYYY, PLACEHOLDER_MM_DD_YYYY,
  MASK_DD_MM_YYYY, MASK_MM_DD_YYYY } from './../../athlete-portal/constants/date-time.constants';
import { GlobalService } from '../../athlete-portal/common-services/global.service';

@Component({
  selector: 'app-step-2',
  templateUrl: './step-2.component.html',
  styleUrls: ['./step-2.component.scss']
})
export class Step2Component implements OnInit {

  @HostListener('window:beforeunload', ['$event']) onBeforeUnload($event) {
    return $event.returnValue = false;
  }

  step2Form;
  heightError;
  weightError;
  ageError;
  height;
  weight;
  dob;
  selectedCountry = "";
  countryQuery = "";
  heightMask;
  preferredMeasurementSystem = 'standard';
  address;

  placeholders = {
    dob: {
      unselect: 'Date of Birth',
      select: PLACEHOLDER_MM_DD_YYYY,
      current: 'Date of Birth'
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
      standard: '0\'00"',
      metric: '000',
    }
  };

  inited = false; // Defer nitialization of "mask" directive so the it's "mask" input is synced with the model's changes

  heightPattern = '^[0-9]+\.[ ]?([0-9]{1,2}[\']?|)$';
  dobPattern = DATE_PATTERN_MM_DD_YYYY;
  dobInputMask = MASK_MM_DD_YYYY;
  countries:Array<any> = [];

  get filteredCountries() {
    const q = this.countryQuery.toLowerCase();
    return this.countries.filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  }

  constructor(
    fb: FormBuilder,
    private onboardService: OnboardService,
    private router: Router,
    private geolocationService: GeolocationService,
    private _globalService: GlobalService,
  ) {
    this.step2Form = fb.group({
      height: ['', Validators.compose([Validators.required, x => this._validateHeight(x)])],
      weight: ['', Validators.compose([Validators.required, x => this._validateWeight(x)])],
      dob: ['', Validators.compose([Validators.required, x => this._validateAge(x)])],
      selectedCountry: ['', Validators.required]
    });
  }

  async ngOnInit() {
    if (!this.onboardService.userHasFields('email', 'password', 'firstName', 'lastName')) {
      this.router.navigate(['/onboard/sign-up']);
      return;
    }

    const {weight, height, preferredMeasurementSystem} = this.onboardService.user;
    if (preferredMeasurementSystem) {
      this.preferredMeasurementSystem = preferredMeasurementSystem;
    }
    this.weight = weight;

    if (preferredMeasurementSystem === 'standard') {
      this.height = this._getHeightFromInches(height);
    } else {
      this.height = height;
    }
    this.inited = true;
    this.countries = await this._globalService.getCountries().toPromise();
    try {
      const { coords } = await this.geolocationService.getCurrentPosition()
      this.address = await this.geolocationService.getAddress(coords);
      if (this.address) {
        const country = this.address.country;
        this.selectedCountry = country;
        this.updateBasedOnCountry(country);
        const { birthDate } = this.onboardService.user;
        const dob = moment(birthDate, 'MM/DD/YY');
        if (dob.isValid()) {
          this.dob = dob.format(this.placeholders.dob.select);
        }
      }
    } catch (err) {
      console.error('Could not get location', err);
    }
  }

  updateBasedOnCountry(country) {
    if (country !== "US") {
      this.preferredMeasurementSystem = "metric";
    } else {
      this.preferredMeasurementSystem = 'standard';
    }
    const isEUCountry = this._globalService.isEUCountry(country);
    if (isEUCountry || country == 'AU') {
      this.dobPattern = DATE_PATTERN_DD_MM_YYYY;
      this.placeholders.dob.select = PLACEHOLDER_DD_MM_YYYY;
      this.dobInputMask = MASK_DD_MM_YYYY;
    }
  }

  onCountryCodeChanged() {
    this.countries.forEach((country) => { if(country.code === this.selectedCountry) {
      this.address.country = country.code;
      this.updateBasedOnCountry(country.code);
    }});
  }

  nextStep(isValid) {
    if (!isValid) {
      return;
    }
    let height;
    if (this.preferredMeasurementSystem === 'standard') {
      const inches = this._getHeightInInches(this.step2Form.controls.height.value);
      height = (inches || 0).toString();
    } else {
      height = this.step2Form.controls.height.value;
    }
    const dobFormat = this.placeholders.dob.select;
    this.onboardService.updateUser({
      height,
      weight: this.step2Form.controls.weight.value,
      birthDate: moment(this.step2Form.controls.dob.value, dobFormat).format('MM/DD/YY'),
      preferredMeasurementSystem: this.preferredMeasurementSystem,
      paymentDetails: this.address,
    });
    this.router.navigate(['onboard/step-3']);
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

  countrySearchQuery(event: Event) {
    this.countryQuery = (event.target as HTMLInputElement).value;
  }

  getWeightPostfix(system: string) {
    if (system === 'standard') {
      return 'lbs';
    }
    return 'kg';
  }

  private _validateHeight({ value }: AbstractControl) {
    if (this.preferredMeasurementSystem === 'standard') {
      if (!value) {
        return;
      }
      if (parseInt(value.split('\'').length) !== 2) {
        this.heightError = 'Invalid Format';
        return { 'incorrect': true };
      }
      if (
        58 > this._getHeightInInches(value) || this._getHeightInInches(value) > 84
      ) {
        this.heightError = 'Please enter a height between 4\'10" and 7\'0"';
        return { 'incorrect': true };
      }
    } else if (this.preferredMeasurementSystem === 'metric') {
      if (parseInt(value) > 213.36 || parseInt(value) < 147.32) {
        this.heightError = 'Please enter a height between 147 cm and 213 cm';
        return { 'incorrect': true };
      }
    }
  }

  private _validateWeight({ value }: AbstractControl) {
    if (!value) {
      return;
    }
    if (this.preferredMeasurementSystem === 'standard') {
      if (parseInt(value) < 90 || parseInt(value) > 400) {
        this.weightError = 'Please enter a weight between 90 lbs and 400 lbs';
        return { 'incorrect': true };
      }
    } else if (this.preferredMeasurementSystem === 'metric') {
      if (parseInt(value) < 40 || parseInt(value) > 180) {
        this.weightError = 'Please enter a weight between 40 kg and 180 kg';
        return { 'incorrect': true };
      }
    }
  }

  private _validateAge({ value }: AbstractControl) {
    if (!value) {
      return;
    }
    const dateDOBFormated = moment(value, this.placeholders.dob.select);
    if (!dateDOBFormated.isValid()) {
      return { 'format': true };
    }
    if ((new Date().getFullYear() - dateDOBFormated.year()) < 13
              || (new Date().getFullYear() - dateDOBFormated.year()) > 99) {
      this.ageError = 'You must be between the ages of 13 and 99';
      return { 'age': true };
    }
  }

  private _getHeightInInches(feetAndInches: string) {
    const feetAndInchesSplit = feetAndInches.split('\'');
    if (feetAndInchesSplit.length === 1 || !feetAndInchesSplit[1]) {
      return 12 * parseInt(feetAndInches.split('\'')[0]);
    } else {
      return 12 * parseInt(feetAndInches.split('\'')[0]) + parseInt(feetAndInches.split('\'')[1]);
    }
  }

  private _getHeightFromInches(input: number) {
    const feet = Math.floor(input / 12);
    const inches = input % 12;
    return `${feet}'${inches}`;
  }
}
