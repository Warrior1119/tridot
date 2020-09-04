import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LocalstorageService } from '../../common-services/localstorage.service';
import { DEFAULT_PREF_DATE_PATTERN } from '../../constants/date-time.constants';

@Component({
  selector: 'app-race-x-profile',
  templateUrl: './race-x-profile.component.html',
  styleUrls: ['./race-x-profile.component.scss']
})
export class RaceXProfileComponent {

  @Input() public race;
  @Input() public details;
  @Input() public races;
  @Output() selectedRace = new EventEmitter();
  @Output() updatedRaceX = new EventEmitter();
  profile: any;

  public hasPrevRace = true;
  public hasNextRace = true;

  constructor(
    private localstorageService: LocalstorageService,
  ) {
    this.profile = this.localstorageService.getAthleteProfileIfExists(); 
  }

  get prefDateFormat() {
    return this.profile && this.profile.prefDateFormat || DEFAULT_PREF_DATE_PATTERN;
  }

  updateRace(race) {
    this.race = race;
    this.selectedRace.next(race);
  }

  onNextRace() {
    const index = this.races.indexOf(this.race);
    if (index === -1) {
      return;
    }
    if (index === this.races.length - 1) {
      this.hasNextRace = false;
      return;
    }
    this.hasPrevRace = true;
    this.updateRace(this.races[index + 1]);
  }

  onPrevRace() {
    const index = this.races.indexOf(this.race);
    if (index === -1) {
      return;
    }
    if (index === 0) {
      this.hasPrevRace = false;
      return;
    }
    this.hasNextRace = true;
    this.updateRace(this.races[index - 1]);
  }

}
