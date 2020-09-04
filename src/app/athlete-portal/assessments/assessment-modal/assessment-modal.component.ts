import * as moment from 'moment';
import { AutoCompleteComponent } from 'ngx-geoautocomplete/auto-complete.component';
import { Component, Input, Output, EventEmitter, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { Animations } from '../../constants/animations';
import { swim_course, bike_ass_type, run_ass_type } from '../../constants/constants';
import { UserProfileService } from '../../user/user-profile/user-profile.service';
import { AssessmentsService } from '../assessments.service';
import { WeeklySummaryService } from '../../season-planner/training-phase/weekly-summary/weekly-summary.service';
import {TextEncodeDecode} from '../../common-model/textEncodeDecode.modal';
import { LocalstorageService } from './../../common-services/localstorage.service';
import { DEFAULT_PREF_DATE_PATTERN } from '../../constants/date-time.constants';

@Component({
  selector: 'app-assessment-modal',
  templateUrl: './assessment-modal.component.html',
  styleUrls: ['./assessment-modal.component.scss'],
  animations: [ Animations.NgIf.ngIfFadeIn, Animations.NgIf.ngIfExpandHeight ],
  encapsulation: ViewEncapsulation.None,
})
export class AssessmentModalComponent implements OnInit, AfterViewInit {

  profile: any;
  user_bikes = [];
  currentBike;
  locationAddress;
  error = {} as any;
  maxDate = new Date();

  @Input() displayModal;
  @Input() assessment = {} as any;
  @Input() sessionType: string;
  @Input() pastAssessments: any[];
  @Output() assessmentChange = new EventEmitter();

  loading = false;
  removing = false;

  swim_course = swim_course;
  bike_ass_type = bike_ass_type;
  run_ass_type = run_ass_type;

  location = [
    'HOME',
    'CURRENT'
  ];

  isDirty = false;

  @ViewChild(AutoCompleteComponent) ng4geoAutoCompleteComponent: AutoCompleteComponent;

  locationSettings = {
    inputPlaceholderText: 'Choose Location',
    showSearchButton: false,
    geoTypes: ['(regions)', '(cities)'],
    showCurrentLocation: true,
    showRecentSearch: true,
  };

  session = {} as any;// TODO: added just to suppress build errors
  editing = false;

  closeModal() {
    this.displayModal.hide();
  }

  constructor(
    private weeklySummaryService: WeeklySummaryService,
    private userProfileService: UserProfileService,
    private assessmentService: AssessmentsService,
    private textEncodeDecode: TextEncodeDecode,
    private localstorageService: LocalstorageService,
  ) {
    this.profile = this.localstorageService.getAthleteProfileIfExists();
  }

  get prefDateFormat() {
    return this.profile && this.profile.prefDateFormat || DEFAULT_PREF_DATE_PATTERN;
  }

  async ngOnInit() {
    if (!this.assessment) {
      this.assessment = await this._prepareCreating(this.sessionType, this.pastAssessments, this.profile);
    } else {
      this.editing = true;

      // display default course type if none was specified before (after modal is opened for editing)
      if (this.sessionType === 'swim' && !this.assessment.courseType) {
        this.assessment.courseType = swim_course[0].id;
      }
    }

    const profile = this.localstorageService.getAthleteProfileIfExists();

    this.user_bikes = profile.bikes;
    this.currentBike = this.user_bikes.find(x => this.session.bikeId == x.bikeId) || this.user_bikes.find(x => x.bikeActive);

    if (this.assessment.city && (this.assessment.state||this.assessment.country)) {
      this.locationSettings = {...this.locationSettings, inputPlaceholderText: `${this.assessment.city}, ${this.assessment.state||this.assessment.country}`};
    } else {
      const accountAddress = await this._getAccountAddress();
      this.locationSettings = {...this.locationSettings, inputPlaceholderText: `${accountAddress.city}, ${accountAddress.state||accountAddress.country}`};
    }
  }

  async onIndoorChange(indoor: boolean) {
    if (indoor) {
      this._setIndoorEnvironment();
    } else {
      this._setWeatherEnvironment(
        this.locationAddress
          ? await this._getWeather(this.assessment, this.locationAddress)
          : await this._getWeatherAtUsersAddress(this.assessment)
      );
    }
  }

  async onDateChange(value) {
    this.assessment.assessmentDate = value;

    this.isDirty = true;

    this._setWeatherEnvironment(
      this.locationAddress
        ? await this._getWeather(this.assessment, this.locationAddress)
        : await this._getWeatherAtUsersAddress(this.assessment)
    );
  }

  async onTimeChange(value) {
    this.assessment.trainAssessTime = value;
    this.isDirty = true;

    this._setWeatherEnvironment(
      this.locationAddress
        ? await this._getWeather(this.assessment, this.locationAddress)
        : await this._getWeatherAtUsersAddress(this.assessment)
    );
  }

  getWeightUnits() {
    if (this.profile.measurementSystem === 'standard') {
      return 'lbs';
    }
    return 'kg';
  }

  getCourseName() {
    switch (this.assessment.courseType) {
      case 'scy':
        return 'SC Yards';
      case 'scm':
        return 'SC Meters';
      case 'lcm':
        return 'LC Meters';
    }
  }

  ngAfterViewInit() {
    // Patch ng4geoAutoCompleteComponent
    const obj = this.ng4geoAutoCompleteComponent;
    const originalFunc = this.ng4geoAutoCompleteComponent['setRecentLocation'];
    this.ng4geoAutoCompleteComponent['setRecentLocation'] = data => {

      data.formatted_address = data.description = _formatGeoLocation(data);

      originalFunc.call(obj, data);
    }
  }

  onEnter($event: KeyboardEvent) {
    ($event.target as HTMLInputElement).blur();
    $event.preventDefault();
    $event.stopPropagation();
  }

  async onLocationChange(location) {
    if (!location || !location.data) {
      return;
    }

    this.locationAddress = {
      coords: {
        latitude: location.data.geometry.location.lat,
        longitude: location.data.geometry.location.lng
      },
      city: getAddressComponent(location.data, 'locality') || '',
      state: getAddressComponent(location.data, 'administrative_area_level_1') || '',
      country: getAddressComponent(location.data, 'country') || '',
      formatted_address: _formatGeoLocation(location.data),
    };

    this.assessment.city = this.locationAddress.city;
    this.assessment.state = this.locationAddress.state;
    this.assessment.country = this.locationAddress.country;

    this._setWeatherEnvironment(await this._getWeather(this.assessment, this.locationAddress));

    this.isDirty = true;
  }

  getTitle() {
    return `${this.sessionType} Assessment`;
  }
  addZeroes( num ) {
    // Cast as number
    var numtemp = Number(num);


    // If there is no decimal, or the decimal is less than 2 digits, toFixed
    if (String(numtemp).split(".").length < 2  ){
      num = numtemp.toFixed(1);
    }
    // Return the number
    this.session.currentWeight=num;
    return [num, 'currentWeight'];
 }
   async save(formData: any, isValid: boolean) {
    var encodedComment=this.textEncodeDecode.getEncodedText(formData.comments)
    formData.comments=encodedComment;
    this.session = formData;
    const validations = [];
    validations.push([this.assessment.assessmentDate, 'assessmentDate']);
    validations.push(this.addZeroes(formData.currentWeight));
    validations.push([formData.temperature, 'temperature']);

    validations.push([formData.humidity, 'humidity']);
    validations.push([formData.elevation, 'elevation']);
    switch (this.sessionType) {
      case ('swim'):
        validations.push([formData.css400, 'css400']);
        validations.push([formData.css200, 'css200']);
        break;
      case ('bike'):
        validations.push([formData.assessmentType, 'assessmentType']);
        validations.push([formData.assessmentTime, 'assessmentTime']);
        validations.push([formData.power, 'power']);
        validations.push([formData.ahr, 'ahr']);
        validations.push([formData.bikeId, 'bikeId']);
        break;
      case ('run'):
        validations.push([formData.assessmentType, 'assessmentType']);
        validations.push([formData.assessmentTime, 'assessmentTime']);
        validations.push([formData.ahr, 'ahr']);
        break;
    }
    let validated = true;
    validations.forEach(validation => {
      if (!this.validate(validation)) {
        validated = false;
      }
    });
    if (!validated || !isValid) return;

    this.loading = true;

    const data = {
      assessmentType: this.assessment.assessmentType,
      city: this.assessment.city,
      state: this.assessment.state,
      country: this.assessment.country,
      ...formData,
      trainAssessTime: this.formatTime(this.assessment.trainAssessTime),
      assessmentDate: moment(this.assessment.assessmentDate).format(DEFAULT_PREF_DATE_PATTERN),
    };

    if (formData['swim_course']) {
      data.courseType = formData['swim_course'];
    }

    if (this.assessment.id) {
      data.id = this.assessment.id;
    }

    try {
      const {newlyGeneratedId} = await this.assessmentService.save(this.sessionType, data);
      this.assessmentChange.next(newlyGeneratedId);
      this.closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  formatDate(date) {
    if (!date) {
      return '';
    }
    const parsed = moment(date);
    return parsed.isValid() ? parsed.format(this.prefDateFormat) : date;
  }

  formatTime(input) {
    if (!input) {
      return '';
    }
    const parsed = moment(input);
    return parsed.isValid() ? parsed.format('hh:mma') : input;
  }

  getWeightUnit() {
    if (this.profile) {
      if (this.profile.measurementSystem === 'standard') {
        return 'lbs';
      } else {
        return 'kg';
      }
    } else {
      return 'lbs';
    }
  }

  getLengthUnit() {
    if (this.profile) {
      if (this.profile.measurementSystem === 'standard') {
        return 'ft';
      } else {
        return 'm';
      }
    } else {
      return 'ft';
    }
  }
  fahrenheitToCelsius(fahrenheit){
    var fTemp = fahrenheit;
    var fToCel = (fTemp - 32) * 5 / 9;
    return fToCel;
  }
  saveTempInFahrenheit(celsius) {
    if (this.profile) {
      if (this.profile.measurementSystem != 'standard') {

        var cTemp = celsius;
        var cToFahr = cTemp * 9 / 5 + 32;
        return Math.round(cToFahr);

      }
      return celsius;
    }
    return  celsius;
  }
  getMetricBasedTemp(temperature){
    temperature = parseInt(temperature);
    if (this.profile) {
      if (this.profile.measurementSystem != 'standard') {
        return Math.round(this.fahrenheitToCelsius(temperature));
      }
      return temperature;

    }
    return temperature;
  }
  getTemperatureUnit(){
    if (this.profile) {
      if (this.profile.measurementSystem != 'standard') {
        return "\xB0C";
      }
      else{
        return "\xB0F";
      }
    }

  }

  validate([value, type]) {
    const MMSSRegex = /^[0-5][0-9]:[0-5][0-9]$/;
    const HHMMSSRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    let msg = '';
    if (!value) {
      if (type === 'temperature' || type === 'humidity' || type === 'elevation' || type === 'ahr'
        || (type === 'power' && (this.session.assessmentType === 'tt_25k' || this.session.assessmentType === 'tt_15m'))
      ) {
        msg = '';
      } else {
        msg = 'This field is required.';
      }
    } else {
      if (type === 'assessmentDate') {
        if (moment(value).isAfter(moment())) {
          msg = 'Please enter a past date and time';
        }
      } else if (type === 'temperature') {
        if (this.profile.measurementSystem === 'standard') {
          if (!this._between(value, 0, 120)) {
            msg = 'Please enter some valid value between 0 ~ 120';
          }
        } else {
          if (!this._between(value, -18, 49)) {
            msg = 'Please enter some valid value between -18 ~ 49';
          }
        }
      } else if (type === 'humidity') {
        if (!this._between(value, 0, 100)) {
          msg = 'Please enter some valid value between 0 ~ 100';
        }
      } else if (type === 'elevation') {
        if (this.profile.measurementSystem === 'standard') {
          if (!this._between(value, 0, 7000)) {
            msg = 'Please enter some valid value between 0 ~ 7000';
          }
        } else {
          if (!this._between(value, 0, 2100)) {
            msg = 'Please enter some valid value between 0 ~ 2100';
          }
        }
      } else if (type === 'currentWeight') {
        if (this.profile.measurementSystem === 'standard') {
          if (!this._between(value, 90, 400)) {
            msg = 'Please enter some valid value between 90 ~ 400';
          }
        } else {
          if (!this._between(value, 40, 180)) {
            msg = 'Please enter some valid value between 40 ~ 180';
          }
        }
      } else if (type === 'css400') {
        const css400Seconds = this._secondsFromHHMMSS(this.session.css400);
        if (!MMSSRegex.test(this.session.css400)) {
          msg = 'Please enter valid time';
        } else if (!this._between(css400Seconds, 3 * 60, 16 * 60 + 30)) {
          msg = 'Please enter some valid value between 3:00 ~ 16:30';
        }
      } else if (type === 'css200') {
        if (!MMSSRegex.test(this.session.css200)) {
          msg = 'Please enter valid time';
        } else if (this.session.css400) {
          const css400Seconds = this._secondsFromHHMMSS(this.session.css400);
          const css200Seconds = this._secondsFromHHMMSS(this.session.css200);
          const upper = Math.min(css400Seconds / 2, 7 * 60 + 50);
          if (!this._between(css200Seconds, 1 * 60 + 26, upper)) {
            msg = 'Please enter some valid value between 1:26 ~ ' + Math.floor(upper / 60) + ':' + ("0" + (Math.floor(upper) % 60)).slice(-2);
          }
        }
      } else if (type === 'assessmentTime') {
        if (!HHMMSSRegex.test(this.session.assessmentTime)) {
          msg = 'Please enter valid time';
        } else {
          const assessmentType = this.session.assessmentType;
          if (assessmentType === 'tt_25k' || assessmentType === 'tt_15m'
            || assessmentType === 'tt_5k' || assessmentType == 'tt_10k'
            || assessmentType == '8mp' || assessmentType == '20mp') {
            const seconds = this._secondsFromHHMMSS(this.session.assessmentTime);
            if (assessmentType === 'tt_25k') {
              if (!this._between(seconds, 29 * 60 + 58, 1 * 3600 + 36 * 60 + 59)) {
                msg = 'Please some valid value between 29:58 ~ 1:36:59';
              }
            } else if (assessmentType === 'tt_15m') {
              if (!this._between(seconds, 28 * 60 + 56, 1 * 3600 + 33 * 60 + 39)) {
                msg = 'Please some valid value between 28:56 ~ 1:33:39';
              }
            } else if (assessmentType === 'tt_5k') {
              if (!this._between(seconds, 12 * 60 + 30, 1 * 3600 + 5 * 60)) {
                msg = 'Please some valid value between 12:30 ~ 1:05:00';
              }
            } else if (assessmentType == 'tt_10k') {
              if (!this._between(seconds, 26 * 60, 45 * 60)) {
                msg = 'Please some valid value between 26:00 ~ 45:00';
              }
            }
            else if (assessmentType == '8mp' || assessmentType == '20mp' ) {
              if (!this._between(seconds, 8 * 60, 1 * 3600)) {
                msg = 'Please some valid value between 08:00 ~ 01:00:00';
              }
            }
          }
        }
      } else if (type === 'power') {
        if (!this._between(value, 30, 700)) {
          msg = 'Please enter some valid value between 30 ~ 700';
        }
      } else if (type === 'ahr') {
        if (!this._between(value, 100, 240)) {
          msg = 'Please enter some valid value between 100 ~ 240';
        }
      }
    }

    if (!msg) {
      // this.assessment[type] = value;
      // if (type === 'temperature' && value) {
      //   this.session[type] = Math.round(parseFloat(value));
      // }
      this.error[type] = '';
      return true;
    } else {
      this.error[type] = msg;
      return false;
    }
  }

  private _between(x, min, max) {
    return x >= min && x <= max;
  }

  private _secondsFromHHMMSS(value) {
    var seconds = 0;
    if (value) {
      var a = value.split(':');
      if (a.length === 3) {
        seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
      } else {
        seconds = (+a[0]) * 60 + (+a[1]);
      }
    }

    return seconds;
  }

  private async _getAccountAddress() {
    try {
      const subscriptionRes = await this.userProfileService.subscription().toPromise();
      const {accountAddress} = subscriptionRes.body.response;
      return accountAddress;
    } catch (err) {
      console.error(err);
    }
  }

  private async _prepareCreating(sessionType: string, pastAssessments, profile) {
    const assessment = {} as any;
    assessment.assessmentDate = new Date();
    assessment.trainAssessTime = new Date();
    if (sessionType === 'swim') {
      assessment.assessmentType = '400/200';
      assessment.courseType = 'scy';
    } else if (sessionType === 'bike') {
      assessment.assessmentType = 'tt_25k';
    } else {
      assessment.assessmentType = 'tt_5k';
    }
    if (pastAssessments.length > 0) {
      assessment.assessmentType = pastAssessments[pastAssessments.length - 1].assessmentType;
    }
    const defaultBike = profile.bikes.find(bike => bike.bikeForTraining == 'true');
    assessment.bikeId = defaultBike ? defaultBike.bikeId :  null;
    assessment.currentWeight = profile.weight;
    try {
      const {city, state, country} = await this._getAccountAddress();
      assessment.city = city;
      assessment.state = state;
      assessment.country = country;
    } catch (err) {
      console.error(err);
    }
    try {
      const weather = await this._getWeatherAtUsersAddress(assessment);
      if (this.profile.measurementSystem === 'standard') {
        assessment.temperature = weather.tempF;
        assessment.elevation = weather.elevationFt;
      } else {
        assessment.temperature = weather.tempC;
        assessment.elevation = weather.elevationMeters;
      }
      assessment.humidity = weather.humidity;
    } catch (err) {
      console.error(err);
    }
    return assessment;
  }

  private async _getWeatherAtUsersAddress(assessment) {
    const res = await this.weeklySummaryService.getWeather(
      moment(assessment.assessmentDate).format('YYYY-MM-DD hh:mm:ss.000'),
      this.formatTime(assessment.trainAssessTime).toUpperCase(),
      'HOME', null).toPromise();
    return res.body.response;
  }

  private async _getWeather(assessment, position) {
    const res = await this.weeklySummaryService.getWeather(
      moment(assessment.assessmentDate).format('YYYY-MM-DD hh:mm:ss.000'),
      this.formatTime(assessment.trainAssessTime),
      'CURRENT', position && position.coords).toPromise();
    return res.body.response;
  }

  private _setIndoorEnvironment() {
    this.assessment.humidity = 30;
    if (this.profile.measurementSystem === 'standard') {
      this.assessment.temperature = 70;
    } else {
      this.assessment.temperature = 20;
    }
  }

  private _setWeatherEnvironment(weather) {
    this.assessment.humidity = weather.humidity;
    if (this.profile.measurementSystem === 'standard') {
      this.assessment.temperature = weather.tempF;
      this.assessment.elevation = weather.elevationFt;
    } else {
      this.assessment.temperature = weather.tempC;
      this.assessment.elevation = weather.elevationMeters;
    }
  }

}

// Format geo location as 'City, State'
export function _formatGeoLocation(data) {
  return ['locality', 'administrative_area_level_1', 'country']
    .map(key => getAddressComponent(data, key))
    .filter(x => x)
    .slice(0, 2)
    .join(', ');
}

export function getAddressComponent(data, key) {
  const found = data.address_components.find(ac => ac.types.includes(key));
  return found && found.short_name;
}
