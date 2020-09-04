import Debounce from 'debounce-decorator';
import * as moment from 'moment';
import { Component, Input, Output, SimpleChanges, EventEmitter, HostListener } from '@angular/core';
import { RACEX_DIVISION, WAIT_AFTER_LAST_KEY_PRESSED_MS, START_TIME_MASK_PATTERNS } from '../../constants/constants';
import { ActivatedRoute } from '@angular/router';
import { isMobileSafari } from '../../../utils/browser';
import { LocalstorageService } from './../../common-services/localstorage.service';

@Component({
  selector: 'app-race-x-sidebar',
  templateUrl: './race-x-sidebar.component.html',
  styleUrls: ['./race-x-sidebar.component.scss']
})
export class RaceXSidebarComponent {
  @Input() races;
  @Input() race;
  @Input() details;
  @Output() updateRaceX = new EventEmitter();
  @Output() selectedRace = new EventEmitter();
  
  athleteProfile: any;
  raceId;
  division = RACEX_DIVISION;
  weightMaskPatterns = {'0': { pattern: /[0-9\.]?/ }};
  weatherIcon: string;

  startTimeError;
  weightError;

  startTimeEdit = false;
  startTimePatterns = START_TIME_MASK_PATTERNS;


  constructor(private route: ActivatedRoute, private localstorageService: LocalstorageService) {
    this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
    this.route.queryParams.subscribe((res) => {
      this.raceId = res.raceId;
    })
  }

  selectRace(races) {
    if (!this.raceId) {
      this.race = races[0];
    } else {
      this.race = races.filter(race => race.raceId == this.raceId)[0]
    }
    this.selectedRace.next(this.race); 
  }

  updateRace(race) {
    this.weightError = null;
    this.race = race;
    this.selectedRace.next(race);
  }

  divisionChange(value) {
    this._update('athleteDivision', value);
  }
  
  @HostListener('document:touchstart', ['$event'])
  onWindowClick(e: MouseEvent) {
    if (!isMobileSafari()) {
      return;
    }
    // For Mobile Safari
    if (e.target && (e.target['classList'].contains('start-time-input') || e.target['classList'].contains('weight-input'))) {
      return;
    }
    // defocus time input when user taps any other element
    try {
      document.querySelector('.start-time-input')['blur']();
      document.querySelector('.weight-input')['blur']();
    } catch (err) {
      console.error(err);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.races && changes.races.currentValue && changes.races.currentValue.length > 0) {
      this.selectRace(changes.races.currentValue);
    }
    if (changes.details && changes.details.currentValue) {
      this.details = changes.details.currentValue;

      if (this.details.raceEventDetails && this.details.raceEventDetails.weather && this.details.raceEventDetails.weather.desc) {
        this.weatherIcon = this._getWeatherIcon(this.details.raceEventDetails.weather.desc);
      }
    }
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

  private _update(key: string, value) {
    this.updateRaceX.next({
      [key]: value,
      raceId: this.race.raceId,
      athleteId: this.race.athleteId,
    });
  }

}
