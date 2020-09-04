import * as moment from 'moment';
import { AutoCompleteComponent } from 'ngx-geoautocomplete/auto-complete.component';
import { Component, Input, Output, EventEmitter, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { Animations } from '../../../../../../constants/animations';
import { WeeklySummaryService } from '../../../weekly-summary.service';
import { START_TIME_MASK_PATTERNS, daily_workout_data } from '../../../../../../constants/constants';
import { UserProfileService } from '../../../../../../user/user-profile/user-profile.service';
import { LocalstorageService } from './../../../../../../common-services/localstorage.service';

@Component({
  selector: 'app-manual-completion-modal',
  templateUrl: './manual-completion-modal.component.html',
  styleUrls: ['./manual-completion-modal.component.scss'],
  animations: [ Animations.NgIf.ngIfFadeIn, Animations.NgIf.ngIfExpandHeight ],
  encapsulation: ViewEncapsulation.None,
})
export class ManualCompletionModalComponent implements OnInit, AfterViewInit {

  interferenceOptions = daily_workout_data.body.interference;
  user_bikes = [];
  currentBike;
  locationAddress;

  @Input() displayModal;
  @Input() session;
  @Output() sessionChange = new EventEmitter();

  loading = false;
  removing = false;
  sessionTime: Date;
  actualTotal: Date;
  plannedTotal: Date;
  location = [
    'HOME',
    'CURRENT'
  ];

  isDirty = false;

  sessionTimePatterns = START_TIME_MASK_PATTERNS;

  msCompletion = [
    { 'value': 1, 'text': '120+% of Intensity' },
    { 'value': 2, 'text': '110% of Intensity' },
    { 'value': 3, 'text': '100% of Intensity' },
    { 'value': 4, 'text': '90% of Intensity' },
    { 'value': 5, 'text': '80% of Intensity' },
    { 'value': 6, 'text': '70% of Intensity' },
    { 'value': 7, 'text': '60% of Intensity' },
    { 'value': 8, 'text': '50% of Intensity' },
    { 'value': 9, 'text': '40% of Intensity' },
    { 'value': 10, 'text': '30% of Intensity' },
    { 'value': 11, 'text': '20% of Intensity' },
    { 'value': 12, 'text': '10% of Intensity' },
    { 'value': 13, 'text': '0% of Intensity' },
    { 'value': 14, 'text': 'Did Different Session' }
  ];

  wuCompletion = [
    { 'value': 1, 'text': 'Completed as Written' },
    { 'value': 2, 'text': 'Completed Modified' },
    { 'value': 3, 'text': 'Skipped it' }
  ];

  interference: any[];

  @ViewChild(AutoCompleteComponent) ng4geoAutoCompleteComponent: AutoCompleteComponent;

  locationSettings = {
    inputPlaceholderText: 'Choose Location',
    showSearchButton: false,
    geoTypes: ['(regions)', '(cities)'],
    showCurrentLocation: true,
    showRecentSearch: true,
  };

  closeModal() {
    this.displayModal.hide();
  }

  constructor(
    private weeklyService: WeeklySummaryService,
    private userProfileService: UserProfileService,
    private localstorageService: LocalstorageService,
  ) { }

  async ngOnInit() {
    this.sessionTime = moment(this.session.sessionTime, 'hh:mmA').toDate();
    this.actualTotal = this.session.actualTotal && this._getActualTotal(this.session.actualTotal);
    this.plannedTotal = this.session.plannedTotal && this._getActualTotal(this.session.plannedTotal);
    this.interference = this.session.interference.slice();
    this.user_bikes = this.localstorageService.getAthleteProfileIfExists().bikes;
    this.currentBike = this.user_bikes.find(x => this.session.bikeId == x.bikeId) || this.user_bikes.find(x => x.bikeActive);
    if (this.session.location === 'HOME') {
      this.locationSettings = { 
        ...this.locationSettings,
        inputPlaceholderText: await this._getAccountAddress(),
      };
    } else if (this.session.location === 'CURRENT') {
      this.ng4geoAutoCompleteComponent.currentLocationSelected();
    } else {
      this.locationSettings.inputPlaceholderText = this.session.location;
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

  onLocationChange(location) {
    if (!location || !location.data) {
      return;
    }

    this.locationAddress = {
      position: {
        lat: location.data.geometry.location.lat,
        lng: location.data.geometry.location.lng
      },
      formatted_address: _formatGeoLocation(location.data),
    };

    this.isDirty = true;
  }

  updateInterference(value: number) {
    this.isDirty = true;
    
    const NONE_VALUE = 0;

    if(value === NONE_VALUE) {
      this.interference = [NONE_VALUE];
      return;
    }

    const noneIndex = this.interference.indexOf(NONE_VALUE);
    if (noneIndex !== -1) {
      this.interference.splice(noneIndex, 1);
    }

    const index = this.interference.indexOf(value);
    if (index !== -1) {
      this.interference.splice(index, 1);
    } else {
      this.interference.push(value);
    }

  }

  get isCompleteWithFile() {
    return this.session.actualTotal && !this.session.wuCompletion && !this.session.msCompletion;
  }

  getTitle() {
    if (
        this.session.actualTotal
     || this.session.linkedFiles && this.session.linkedFiles.length > 0
    ) {
      return 'Edit Session Details';
    } else {
      return 'Manual Completion';
    }
  }

  async save(formData: any, isValid: boolean) {
    // Late form validation allows the red borders appear around invalid fields.
    if (!isValid) {
      return;
    }
    this.loading = true;
    try {

      const changes = {
        sessionTime: moment(formData.sessionTime).format('hh:mmA'),
        actualTotal: moment.duration(moment(formData.actualTotal).format('HH:mm:ss')).asSeconds(),
        interference: this.interference,
        location: this.locationAddress ? this.locationAddress.formatted_address : 'HOME',
        wuCompletion: formData.wuCompletion,
        msCompletion: formData.msCompletion,
        indoor: formData.indoor ? 'true' : 'false',
        bikeId: this.currentBike && this.currentBike.bikeId,
      };

      await this.weeklyService.updateDayData(changes, this.session.sessionId, this.locationAddress ? this.locationAddress.position : null);
      Object.apply(this.session, changes);

      this.sessionChange.next();
      this.closeModal();

    } finally {
      this.loading = false;
    }
  }

  async remove() {
    this.removing = true;
    try {

      const changes = {
        actualTotal: 0,
        wuCompletion: null,
        msCompletion: null,
        interference: [],
        location: 'HOME',
      };

      await this.weeklyService.updateDayData(changes, this.session.sessionId);
      Object.apply(this.session, changes);

      this.sessionChange.next();
      this.closeModal();

    } finally {
      this.removing = false;
    }
  }

  private _getActualTotal(seconds: string) {
    const date = new Date(null);
    const c = moment.duration(parseInt(seconds), 'seconds');
    date.setHours(c.hours());
    date.setMinutes(c.minutes());
    date.setSeconds(c.seconds());
    return date;
  }

  private async _getAccountAddress() {
    try {
      const subscriptionRes = await this.userProfileService.subscription().toPromise();
      const {accountAddress} = subscriptionRes.body.response;
      return [accountAddress.city, accountAddress.state]
        .filter(x => x)
        .join(', ');
    } catch (err) {
      console.error(err);
    }
  }

}

// Format geo location as 'City, State'
function _formatGeoLocation(data) {
  return ['locality', 'administrative_area_level_1', 'country']
    .map(key => {
      const found = data.address_components.find(ac => ac.types.includes(key));
      return found && found.short_name;
    })
    .filter(x => x)
    .slice(0, 2)
    .join(', ');
}