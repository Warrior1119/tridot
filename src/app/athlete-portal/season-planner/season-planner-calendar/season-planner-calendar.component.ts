import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { LocalstorageService } from '../../common-services/localstorage.service';
import { PLACEHOLDER_DD_MM_YYYY } from '../../constants/date-time.constants';

@Component({
  selector: 'season-planner-calendar',
  templateUrl: './season-planner-calendar.component.html',
  styleUrls: ['./season-planner-calendar.component.scss']
})
export class SeasonPlannerCalendarComponent implements OnInit {
  @Input() currentPlan;
  @Output('deleteRace') delete = new EventEmitter();

  page = 1;
  selectedWeek;
  private _hoverPhaseId: number;
  profile: any;

  constructor(
    private router: Router,
    private localstorageService: LocalstorageService,
  ) {
    this.profile = this.localstorageService.getAthleteProfileIfExists(); 
  }

  get prefDateFormatMmm () {
    return this.profile && this.profile.prefDateFormat === PLACEHOLDER_DD_MM_YYYY
      ? 'D MMM, YYYY'
      : 'MMM D, YYYY';
  }

  get prefDateFormatLong () {
    return this.profile && this.profile.prefDateFormat === PLACEHOLDER_DD_MM_YYYY
      ? 'D MMMM, YYYY'
      : 'MMMM D, YYYY';
  }

  ngOnInit() {
  }

  setWeek(week) {
    this.selectedWeek = week;
  }

  getPhaseBorder(rows) {
    const phase = this.currentPlan.phases.filter(phs => parseInt(phs.phaseId) === rows.phaseId)[0];

    const developmentRaceFound = phase.races.find(race => race.raceType === 'Development');
    if (developmentRaceFound) {
      return 'dev-phase';
    }

    const preparationRaceFound = phase.races.find(race => race.raceType === 'Race Prep');
    if (preparationRaceFound) {
      return 'prep-phase';
    }

    return 'no-phase';
  }

  goToTrainingPhase(week) {
    this.router.navigate(['/season-planner/training-phase'], { queryParams: { phaseId: week.phaseId } });
  }

  setHoverPhase(data) {
    this._hoverPhaseId = data && data[0] && data[0].phaseId;
  }

  removeHoverPhase() {
    this._hoverPhaseId = null;
  }

  isHoverPhase(data) {
    return this._hoverPhaseId === (data && data[0] && data[0].phaseId);
  }

  addRace(week) {
    this.router.navigate(['/season-planner/training-phase/add-a-race']);
  }

  goToRace(week) {
    this.router.navigate(['/racex'], { queryParams: {raceId: week.raceData.raceId}});
  }

  deleteRace(week) {
    this.delete.emit(week);
  }
}
