import Debounce from 'debounce-decorator';
import * as moment from 'moment';
import { Component, Input, Output, EventEmitter, OnChanges, OnInit, HostListener } from '@angular/core';
import { WeeklySummaryService } from '../../weekly-summary.service'
import { START_TIME_MASK_PATTERNS, DEFAULT_ERROR_MESSAGE, WAIT_AFTER_LAST_KEY_PRESSED_MS, TABLET_WIDTH_THRESHOLD } from '../../../../../constants/constants';
import { ToastrService } from 'ngx-toastr';
import { UserProfileService } from '../../../../../user/user-profile/user-profile.service';
import { isMobileSafari, getWindowWidth } from '../../../../../../utils/browser';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { SessionTimepickerComponent } from '../session-timepicker/session-timepicker.component';
import { CommonUtils } from '../../../../../common-util/common-utils';
@Component({
  selector: 'app-session-numbers',
  templateUrl: './session-numbers.component.html',
  styleUrls: ['./session-numbers.component.scss'],
})

export class SessionNumbersComponent implements OnInit, OnChanges {
  @Input() session: any;
  @Input() weather: any;
  @Input() profile;
  @Output() sessionChange = new EventEmitter();

  modalRef: BsModalRef;

  alerts: any[] = [];
  user_bikes = [];
  currentBike;

  sessionTimeEdit = false;
  sessionTimeError;
  sessionTimePatterns = START_TIME_MASK_PATTERNS;
  accountAddress;
  trainXTitleMessage = '';

  constructor(
    private weeklyService: WeeklySummaryService,
    private toastr: ToastrService,
    private userProfileService: UserProfileService,
    private modalService: BsModalService,
  ) { }

  get hasLocation() {
    if (!this.session || !this.session.location) {
      return false;
    }

    if (this.session.location === 'HOME' || this.session.location === 'CURRENT') {
      return false;
    }

    return true;
  }

  async ngOnInit() {
    this.accountAddress = await this._getAccountAddress();
  }

  ngOnChanges() {
    if (this.session && this.session.sessionType === 'bike') {
      this.user_bikes = this.profile.bikes;
      this.currentBike = this.user_bikes && (this.user_bikes.find(x => this.session.bikeId == x.bikeId) || this.user_bikes.find(x => x.bikeActive));
    }
  }

  convertToHHMM(seconds) {
    if (seconds === null) {
      return '';
    }
    const date = new Date(null);
    date.setSeconds(parseInt(seconds)); // specify value for SECONDS here
    return date.toISOString().substr(11, 5);
  }

  editTime() {
    this._displayTimepicker();
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
      document.querySelector('.session-time-input')['blur']();
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
    if(this.session.sessionTime != sessionTime){
      this.session.sessionTime = sessionTime;
    this._update('sessionTime', sessionTime);
    }
    
  }
  getElevation() {
    if (this.profile.measurementSystem === 'standard') {
      return this.weather.elevationFt + ' Ft';
    } else {
      return this.weather.elevationMeters + ' m';
    }
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

  private async _getAccountAddress() {
    try {
      const subscriptionRes = await this.userProfileService.subscription().toPromise();
      const {accountAddress} = subscriptionRes.body.response;
      return accountAddress;
    } catch (err) {
      console.error(err);
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

}
