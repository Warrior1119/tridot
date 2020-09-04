import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import Debounce from 'debounce-decorator';
import * as moment from 'moment';
import { WAIT_AFTER_LAST_KEY_PRESSED_MS, START_TIME_MASK_PATTERNS } from '../../constants/constants';
import { LocalstorageService } from './../../common-services/localstorage.service';

@Component({
  selector: 'app-race-x-environment',
  templateUrl: './race-x-environment.component.html',
  styleUrls: ['./race-x-environment.component.scss']
})
export class RaceXEnvironmentComponent {
  @Input() race;
  @Input() details;
  @Output() updateRaceX = new EventEmitter();

  athleteProfile: any;
  weatherIcon: string;

  startTimeEdit = false;
  startTimePatterns = START_TIME_MASK_PATTERNS;
  weightMaskPatterns = {'0': { pattern: /[0-9\.]?/ }};
  startTimeError;
  weightError;
  
  constructor(private localstorageService: LocalstorageService) {
    this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.details && changes.details.currentValue) {
      this.details = changes.details.currentValue;

      if (this.details.raceEventDetails && this.details.raceEventDetails.weather && this.details.raceEventDetails.weather.desc) {
        this.weatherIcon = this._getWeatherIcon(this.details.raceEventDetails.weather.desc);
      }
    }
  }

  @Debounce(WAIT_AFTER_LAST_KEY_PRESSED_MS)
  updateStartTime(input: string) {
    this.startTimeError = null;
    if (!input) {
      this.startTimeError = 'Start time is required';
      return;
    }
    if (input.length < 7 || !moment(input, 'hh:mm a').isValid()) {
      this.startTimeError = 'Start time should be in format HH:MM AM/PM';
      return;
    }
    const startTime = moment(input, 'hh:mm a').format('hh:mm A');
    if(this.details.uiRaceDetails.myStartTime != startTime){
      this.details.uiRaceDetails.myStartTime = startTime;
      this._update('myStartTime', startTime);
      this.startTimeEdit =false;
    }
   
    
  }

  @Debounce(WAIT_AFTER_LAST_KEY_PRESSED_MS)
  updateWeight(value: string) {
    if (!this._validateWeight(value)) {
      return;
    }
    const newWeight = parseInt(value);
    if (this.details.uiRaceDetails.raceDateAthleteWeightUi === newWeight) {
      return;
    }
    this._update('raceDateAthleteWeightUi', newWeight);
  }
  
  getStartTime(input: string) {
    return moment(input, 'hh:mm A').format('hh:mm a');
  }

  getWeightPlaceholder() {
    if (this.athleteProfile.measurementSystem === 'standard') {
      return '0 lbs';
    }
    return '0 kg';
  }

  getWeightPostfix() {
    if (this.athleteProfile.measurementSystem === 'standard') {
      return 'lbs';
    }
    return 'kg';
  }

  getElevation() {
    if (this.athleteProfile.measurementSystem === 'standard') {
      return `${this.details.raceEventDetails.weather.elevationFt} ft`;
    }
    return `${this.details.raceEventDetails.weather.elevationMeters} m`;
  }

  private _getWeatherIcon(desc: string) {
    if (desc.match(/cloud/i)) {
      return '../assets/img/svg/icons/weather-cloudy-icon.svg';
    }
    if (desc.match(/snow/i)) {
      return '../assets/img/svg/icons/weather-snow-icon.svg';
    }
    if (desc.match(/rain/i)) {
      return '../assets/img/svg/icons/weather-rain-icon.svg';
    }
    return '../assets/img/svg/icons/weather-sun-icon.svg';
  }

  private _validateWeight(value: string) {
    this.weightError = null;
    if (!value) {
      return true;
    }
    if (this.athleteProfile.measurementSystem === 'standard') {
      if (parseInt(value) < 90 || parseInt(value) > 400) {
        this.weightError = 'Please enter a weight between 90 lbs and 400 lbs';
        return false;
      }
      return true;
    } else if (this.athleteProfile.measurementSystem === 'metric') {
      if (parseInt(value) < 40 || parseInt(value) > 180) {
        this.weightError = 'Please enter a weight between 40 kg and 180 kg';
        return false;
      }
      return true;
    }
    return true;
  }

  private _update(key: string, value) {
    this.updateRaceX.next({
      [key]: value,
      raceId: this.race.raceId,
      athleteId: this.race.athleteId,
    });
  }
}
