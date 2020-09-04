import Debounce from 'debounce-decorator';
import * as moment from 'moment';
import { Component, Input, Output, EventEmitter, OnChanges, OnInit, HostListener } from '@angular/core';
import { WeeklySummaryService } from '../../weekly-summary.service'
import { START_TIME_MASK_PATTERNS, DEFAULT_ERROR_MESSAGE, WAIT_AFTER_LAST_KEY_PRESSED_MS, KM_TO_MI_MULT, M_TO_YD_MULT, TABLET_WIDTH_THRESHOLD } from '../../../../../constants/constants';
import { ToastrService } from 'ngx-toastr';
import { UserProfileService } from '../../../../../user/user-profile/user-profile.service';
import { isMobileSafari, getWindowWidth } from '../../../../../../utils/browser';
import {SeasonZoneSharedDataService} from '../session-zones/session-zones-shared.service';
import { CommonUtils } from '../../../../../common-util/common-utils';
import { BsModalService} from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { SessionTimepickerComponent } from '../session-timepicker/session-timepicker.component';


@Component({
  selector: 'app-session-numbers-complete',
  templateUrl: './session-numbers-complete.component.html',
  styleUrls: ['./session-numbers-complete.component.scss'],
})

export class SessionNumbersCompleteComponent implements OnInit, OnChanges {
  @Input() session: any;
  @Input() weather: any;
  @Input() profile;
  @Output() sessionChange = new EventEmitter();
  @Input() selectedParam: string;

  overrideTemp: any;
  overrideHumidity: any;
  overrideElevation: any;
  originalOverrides: any = {};
  errors: any = {};
  loadingWeatherNumbers = false;

  alerts: any[] = [];
  user_bikes = [];
  currentBike;
  modalRef: BsModalRef;
  sessionTimeEdit = false;
  sessionTimeError;
  sessionTimePatterns = START_TIME_MASK_PATTERNS;

  accountAddress;
  trainXTitleMessage = '';

  constructor(
    private weeklyService: WeeklySummaryService,
    private toastr: ToastrService,
    private userProfileService: UserProfileService,
    private sessionSelectedParam: SeasonZoneSharedDataService,
    private modalService: BsModalService,
  ) { }

  get isMobileOrTablet() {
    return getWindowWidth(window) < TABLET_WIDTH_THRESHOLD;
  }

  get areWeatherNumbersValid() {
    return !this.errors['temperature'] && !this.errors['humidity'] && !this.errors['elevation'];
  }

  get hasLocation() {
    if (!this.session || !this.session.location) {
      return false;
    }

    if (this.session.location === 'HOME' || this.session.location === 'CURRENT') {
      return false;
    }

    return true;
  }

  get temp() {
    switch (this.profile.measurementSystem) {
      case 'standard': return this.weather && this.weather.tempF;
      case 'metric': return this.weather && this.weather.tempC;
    }
  }

  editTime() {
    this._displayTimepicker();
  }

  getLinkedData(statName: string) {
    if (!this.session.isLinkedFile) {
      return false;
    }
    if (!this.session.activityStats) {
      return this._getLegacyStats(statName);
    }
    const data = this.session.activityStats;
    switch (statName) {
      case 'distance': {
        return +data.distance.toFixed(1);
      }
      case 'avg-speed': {
        return +data.avgSpeed;
      }
      case 'avg-pace': {
        return data.avgPace;
      }
      case 'avg-moving-pace': {
        return data.avgMovingPace
      }
      case 'heartrate': {
        return +data.avgHeartRate;
      }
      case 'power': {
        return +data.avgPower;
      }
      case 'elevation': {
        return typeof data.totalElevationGain === 'number' ? data.totalElevationGain.toString() : data.totalElevationGain;
      }
      case 'calories': {
        return data.calories;
      }
      default: return false;
    }
  }

  async ngOnInit() {
    this.accountAddress = await this._getAccountAddress();
    this.sessionSelectedParam.setSelectedParam(this.selectedParam);
  }

  ngOnChanges() {
    if (this.session && this.session.sessionType === 'bike') {
      this.user_bikes = this.profile.bikes;
      this.currentBike = this.user_bikes && (this.user_bikes.find(x => this.session.bikeId == x.bikeId) || this.user_bikes.find(x => x.bikeActive));
    }

    this.overrideTemp = this.temp;
    this.overrideHumidity = this.weather && this.weather.humidity;
    this.overrideElevation = this.profile.measurementSystem === 'standard' ? this.weather && this.weather.elevationFt : this.weather && this.weather.elevationMeters;

    this.originalOverrides.overrideTemp = this.overrideTemp;
    this.originalOverrides.overrideHumidity = this.overrideHumidity;
    this.originalOverrides.overrideElevation = this.overrideElevation;
  }

  validateWeatherNumbers(type, value) {
    let msg;
    if (type === 'temperature') {
      if (this.profile.measurementSystem === 'standard') {
        if (!value || !this._between(value, 0, 120)) {
          msg = 'Please enter some valid value between 0 ~ 120';
        }
      } else {
        if (!value || !this._between(value, -18, 49)) {
          msg = 'Please enter some valid value between -18 ~ 49';
        }
      }
    } else if (type === 'humidity') {
      if (!value || !this._between(value, 0, 100)) {
        msg = 'Please enter some valid value between 0 ~ 100';
      }
    } else if (type === 'elevation') {
      if (this.profile.measurementSystem === 'standard') {
        if (!value || !this._between(value, 0, 7000)) {
          msg = 'Please enter some valid value between 0 ~ 7000';
        }
      } else {
        if (!value || !this._between(value, 0, 2100)) {
          msg = 'Please enter some valid value between 0 ~ 2100';
        }
      }
    }

    this.errors[type] = msg;
  }

  cancelWeatherValues() {
    this.overrideTemp = this.originalOverrides.overrideTemp;
    this.overrideHumidity = this.originalOverrides.overrideHumidity;
    this.overrideElevation = this.originalOverrides.overrideElevation;

    this.errors = {};
  }

  convertToHHMM(seconds) {
    if (seconds === null) {
      return '';
    }
    const date = new Date(null);
    date.setSeconds(parseInt(seconds)); // specify value for SECONDS here
    return date.toISOString().substr(11, 5);
  }

  updateActualTotal(duration: string) {
    const seconds = moment.duration(duration).asSeconds();
    this.session.actualTotal = seconds;
    this._update('actualTotal', seconds);
  }

  updateIndoor(value) {
    this._update('indoor', value);
  }

  @HostListener('document:touchstart', ['$event'])
  onWindowClick(e: MouseEvent) {
    if (!isMobileSafari()) {
      return;
    }
    // For Mobile Safari
    if (e.target && e.target['classList'].contains('session-time-input')) {
      return;
    }
    // defocus session time input when user taps any other element
    try {
      const sessionTimeInput = document.querySelector('.session-time-input');
      sessionTimeInput && sessionTimeInput['blur']();
    } catch (err) {
      console.error(err);
    }
  }
  getUpdateAttributesSuccessName(key){
    // TODO nee to do for all other key except start time
    switch (key) {
      case "sessionTime":
            return "Session time has been updated.";

      default: return "Updated";

    }
  }
  private async _update(key, value?) {
    const updatedObj = (typeof key === 'object' && typeof value === 'undefined') ? key : {[key]: value};
    try {
      await this.weeklyService.updateDayData(updatedObj, this.session.sessionId);
      CommonUtils.modalMessage(this.getUpdateAttributesSuccessName(key), '', this.modalRef, 'success', this.modalService, 'View Session');
      this.sessionChange.emit();
    } catch (err) {
      this.toastr.error(err && err.body && err.body.response && err.body.response.msg || DEFAULT_ERROR_MESSAGE);
    }
  }

  async updateLocation(value: string) {
    this._update('location', value);
    this.session.location = value;
  }

  isSessionTimeExists(input: string) {
    return ;
  }

  getSessionTime(input: string) {
    const parsed = moment(input, 'hh:mmA');
    if (!parsed.isValid()) {
      return '--:--';
    }
    return parsed.format('hh:mm a');
  }

  getScore(): string {
    let trainxScore = 'N/A'
    if (this.session) {
      trainxScore = this.session.achievement || this.session.achievementHr;
      if (!trainxScore || trainxScore == 'na') {
        trainxScore = 'N/A';
        this.trainXTitleMessage = 'TrainX only applies to TriDot-generated sessions.';
      }
    }
    return trainxScore;
  }

  @Debounce(WAIT_AFTER_LAST_KEY_PRESSED_MS)
  updateSessionTime(input: string) {
    this.sessionTimeError = null;
    if (!input) {
      this.sessionTimeError = 'Start time is required';
      return;
    }
    if (input.length < 7 || !moment(input, 'hh:mm a').isValid()) {
      this.sessionTimeError = 'Start time should be in format HH:MM AM/PM';
      return;
    }
    const sessionTime = moment(input, 'hh:mm a').format('hh:mmA');
    this.session.sessionTime = sessionTime;
    if(this.session.sessionTime != sessionTime){
      this.session.sessionTime = sessionTime;
    this._update('sessionTime', sessionTime);
    }  }

  getElevation() {
    if (this.profile.measurementSystem === 'standard') {
      return 'Ft';
    }

    return 'm';
  }

  getWeatherIcon(desc: string) {
    if (desc && desc.match(/cloud/i)) {
      return '../assets/img/svg/icons/weather-cloudy-icon.svg';
    }
    if (desc && desc.match(/snow/i)) {
      return '../assets/img/svg/icons/weather-snow-icon.svg';
    }
    if (desc && desc.match(/rain/i)) {
      return '../assets/img/svg/icons/weather-rain-icon.svg';
    }
    return '../assets/img/svg/icons/weather-sun-icon.svg';
  }

  getZoneClass(zone) {
    if (zone.zoneType === 'z1') {
      return 'z1';
    }
    if (zone.zoneType === 'z2') {
      return 'z2';
    }
    if (zone.zoneType === 'z3') {
      return 'z3';
    }
    if (zone.zoneType === 'z4') {
      return 'z4';
    }
    if (zone.zoneType === 'z5') {
      return 'z5';
    }
    if (zone.zoneType === 'z6') {
      return 'z6';
    }
  }

  getZoneWidth(session, zone) {
    const plannedSessionToatl = parseInt(session.plannedTotal);
    const zonePlannedTotal = parseInt(zone.planned);
    const total = (zonePlannedTotal / plannedSessionToatl) * 100;
    return '' + total + '%';
  }

  getZoneStyle(session, zone) {
    const plannedSessionToatl = parseInt(session.plannedTotal);
    const zonePlannedTotal = parseInt(zone.planned);
    const total = (zonePlannedTotal / plannedSessionToatl) * 100;

    let first = 0;
    let last = session.zones.length - 1;
    for (let index = 0; index < session.zones.length; index++) {
      const znPlanned = parseInt(session.zones[index].planned);
      if (znPlanned > 0) {
        first = index;
        break;
      }
    }

    for (let index = session.zones.length - 1; index >= 0; index--) {
      const znPlanned = parseInt(session.zones[index].planned);
      if (znPlanned > 0) {
        last = index;
        break;
      }
    }

    const style = {
      'width': total + '%',
      'height': '15px'
    };

    if (zone.zoneType === session.zones[first].zoneType) {
      style['border-bottom-left-radius'] = '3px';
    }

    if (zone.zoneType === session.zones[last].zoneType) {
      style['border-bottom-right-radius'] = '3px';
    }
    return style;
  }

  getLocationText() {
    if (this.session && this.session.location && this.session.location.toLowerCase() !== 'home') {
      return this.session.location;
    }
    return `${ this.accountAddress.city }, ${ this.accountAddress.state || this.accountAddress.country }`;
  }

  saveWeatherNumbers() {
    this.loadingWeatherNumbers = true;
    this.weeklyService.updateWeatherData(this.session.sessionId, {
      overrideTemp: this.overrideTemp.toString(),
      overrideHumidity: this.overrideHumidity.toString(),
      overrideElevation: this.overrideElevation.toString(),
    })
      .then(() => {
        this.originalOverrides.overrideTemp = this.overrideTemp;
        this.originalOverrides.overrideHumidity = this.overrideHumidity;
        this.originalOverrides.overrideElevation = this.overrideElevation;
        this.sessionChange.emit();

        this.loadingWeatherNumbers = false;
      })
      .catch((error) => {
        console.log(error);
        this.loadingWeatherNumbers = false;
      });
    console.log('save');
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

  private _getLegacyStats(statName: string) {
    if (!this.session.fallbackStats) {
      return false;
    }
    const data = this.session.fallbackStats;
    switch (statName) {
      case 'distance': {
        let dist = +data.distance;
        if (this.session.sessionType === 'swim') {
          return Math.round(dist);
        }
        dist = dist / 1000;
        return +(this.profile.measurementSystem === 'standard' ? dist * KM_TO_MI_MULT : dist).toFixed(1);
      }
      case 'speed': {
        const speedKph = data.avgSpeed * 3.6;
        return +(this.profile.measurementSystem === 'standard' ? speedKph * KM_TO_MI_MULT : speedKph).toFixed(1);
      }
      case 'avg-pace': {
        const paceSeconds = this.profile.measurementSystem === 'standard' ? data.avgPace * M_TO_YD_MULT : data.avgPace;
        return moment.utc(moment.duration(paceSeconds, 'seconds').asMilliseconds()).format('mm:ss');
      }
      case 'avg-moving-pace': {
        const paceSeconds = this.profile.measurementSystem === 'standard' ? data.avgMovingPace * M_TO_YD_MULT : data.avgMovingPace;
        return moment.utc(moment.duration(paceSeconds, 'seconds').asMilliseconds()).format('mm:ss');
      }
      case 'heartrate': {
        return +data.avgHeartRate;
      }
      case 'power': {
        return Math.round(+data.avgWatts);
      }
      case 'elevation': {
        return +(this.profile.measurementSystem === 'standard' ? +data.totalElevationGainInFeet : data.totalElevationGain).toFixed(1);
      }
      case 'calories': {
        return data.calories;
      }
      default: return false;
    }
  }

  private _displayTimepicker() {
    const initialState = {
      time: this.session.sessionTime
    };

    this.modalRef = this.modalService.show(SessionTimepickerComponent, { class: 'modal-sm', initialState });
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.updateTime.subscribe(time =>  {
      if (!time) {
        return this.modalRef.hide();
      }
      const sessionTime = moment(time).format('hh:mmA');
      this.session.sessionTime = sessionTime;
      this._update('sessionTime', sessionTime);
      this.modalRef.hide();
    });
  }

  private _between(x, min, max) {
    return x >= min && x <= max;
  }
}
