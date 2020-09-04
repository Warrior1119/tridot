import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LocalstorageService } from '../../common-services/localstorage.service';
import { PLACEHOLDER_DD_MM_YYYY } from '../../constants/date-time.constants';

@Component({
  selector: 'app-race-details-mobile',
  templateUrl: './race-details-mobile.component.html',
  styleUrls: ['./race-details-mobile.component.scss']
})
export class RaceDetailsMobileComponent {

  @Input() race;
  @Output() action = new EventEmitter();
  
  profile: any;

  constructor(
    private localstorageService: LocalstorageService,
  ) {
    this.profile = this.localstorageService.getAthleteProfileIfExists(); 
  }

  get prefDateFormatLong () {
    return this.profile && this.profile.prefDateFormat === PLACEHOLDER_DD_MM_YYYY
      ? 'D MMMM, YYYY'
      : 'MMMM D, YYYY';
  }

}
