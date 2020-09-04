import { Component, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { SeasonPlannerService } from '../season-planner.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AddRenameSeasonComponent } from '../add-rename-season/add-rename-season.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ConfirmationModalComponent } from '../../common-components/confirmation-modal/confirmation-modal.component';
import { PhasePreferencesComponent } from './phase-preferences/phase-preferences.component';
import { DEFAULT_ERROR_MESSAGE, SCHEDULE_ROW_LENGTH, MOBILE_WIDTH_THRESHOLD } from '../../constants/constants';
import { chunks } from '../../../utils/array';
import { ToastrService } from 'ngx-toastr';
import { getWindowWidth } from '../../../utils/browser';
import { Animations } from '../../constants/animations';
import { LocalstorageService } from '../../common-services/localstorage.service';
import { PLACEHOLDER_DD_MM_YYYY } from '../../constants/date-time.constants';

@Component({
  selector: 'app-training-phase',
  templateUrl: './training-phase.component.html',
  styleUrls: ['./training-phase.component.scss'],
  animations: [ Animations.NgIf.ngIfFadeIn, Animations.NgIf.ngIfExpandHeight ],
  encapsulation: ViewEncapsulation.None,
})
export class TrainingPhaseComponent {
  plans;
  selectedSeason;
  loading;
  currentPlan;
  calendarEvents;
  phaseId: number;
  entirePhase = {
    phase: '',
    weeksExceptLast: [],
    race: null,
    lastWeek: null,
  };
  modalRef: BsModalRef;
  alerts: any[] = [];
  @ViewChild('seasonMenu', { read: ElementRef }) seasonMenu;
  expandedWeek: number;
  profile: any;

  private _hoverPhaseId: number;

  constructor(
    private seasonPlannerService: SeasonPlannerService,
    private router: Router,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private localstorageService: LocalstorageService,
  ) {
    this.profile = this.localstorageService.getAthleteProfileIfExists(); 

    this.route.queryParams.subscribe((res) => {
      this.phaseId = parseInt(res.phaseId);

      if (!this.phaseId) {
        this.router.navigate(['/season-planner']);
      }

      this.getPlans(this.phaseId);
    });
  }

  get weeks() {
    const weeks = this.entirePhase.weeksExceptLast as any;
    return weeks.flat()
  }

  get phaseClass() {
    return this.entirePhase.race.raceType === 'Race Prep' ? 'prep-phase' : 'dev-phase';
  }

  get borderClass() {
    return this.entirePhase.race.raceType === 'Race Prep' ? 'arrow-prep' : 'arrow-dev';
  }

  get prefDateFormatLong () {
    return this.profile && this.profile.prefDateFormat === PLACEHOLDER_DD_MM_YYYY
      ? 'D MMMM, YYYY'
      : 'MMMM D, YYYY';
  }

  getRowEnd(i: number) {
    return i + 6 - ((i + 1) % 6 || 6);
  }

  isRowExpanded(i: number) {
    return i === Math.min(this.getRowEnd(i), this.weeks.length - 1) &&
      this.expandedWeek <= this.getRowEnd(i) &&
      this.expandedWeek > this.getRowEnd(i) - 6;
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

  getPhaseSchedule(phaseId, raceId) {
    this.seasonPlannerService.getPhaseSchedule(phaseId, raceId).subscribe((res) => {
      console.log(res);
      this.calendarEvents = res.body.response[0].calendarEvents;
    });
  }

  goToTrainingPhase(week) {
    this.router.navigate(['/season-planner/training-phase'], { queryParams: { phaseId: week.phaseId } });
    // location.reload();
  }


  openTrainingPreferences() {
    const initialState = {
      phaseId: this.entirePhase.phase['phaseId'],
      raceId: this.entirePhase.race['raceId'],
      raceDistanceId: parseInt(this.entirePhase.race['raceDistanceId'], 10),
    };
    this.modalRef = this.modalService.show(PhasePreferencesComponent, { initialState, class: 'modal-lg', backdrop: 'static' });
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.preferences.subscribe((preferences) => {
      console.log(preferences);
    });
  }

  getPhaseDetails(plan) {
    const weeks = plan.seasonSchedule.filter(week => week.phaseId === this.phaseId);
    const phase = plan.phases.find(phs => parseInt(phs.phaseId) === this.phaseId);
    const race = phase.races.find(rc => rc.raceId === phase.raceId);

    const size = SCHEDULE_ROW_LENGTH;
    this.entirePhase.weeksExceptLast = chunks(weeks.slice(0, weeks.length - 1), size);
    this.entirePhase.lastWeek = weeks[weeks.length - 1];

    this.entirePhase.phase = phase;
    this.entirePhase.race = race;

    console.log('entirePhase', this.entirePhase);

    // this.getPhaseSchedule(phase.phaseId,race.raceId);
  }

  getEntirePhaseBorder() {
    if (!this.entirePhase || !this.entirePhase.race) {
      return 'no-phase';
    }

    if (this.entirePhase.race.raceType === 'Development') {
      return 'dev-phase';
    } else if (this.entirePhase.race.raceType === 'Race Prep') {
      return 'prep-phase';
    } else {
      return 'no-phase';
    }
  }

  getPhaseBorder(rows) {
    const phase = this.currentPlan.phases.filter(phs => parseInt(phs.phaseId) === rows.phaseId)[0];
    if (phase === undefined) {
      return 'no-phase';
    }
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

  async getPlans(phaseId: number) {
    this.loading = true;
    try {
      this.plans = await this.seasonPlannerService.getPlans(phaseId);
      this.loading = false;
      this.currentPlan = this.plans.find(plan => plan.isThisPrimarySeason === 'true');

      this.getPhaseDetails(this.currentPlan);

      const filterSchedule = this.currentPlan.seasonSchedule
        .filter(week =>
          week.phaseId !== this.entirePhase.phase['phaseId']
       && new Date(week.weekdayStartDate).getTime() > new Date(this.entirePhase.phase['phaseEndDate']).getTime());

      console.log(filterSchedule.length);
      console.log(this.currentPlan);
    } catch (err) {
      this.loading = false;
      console.error(err);
    }
  }

  async getPlanById(season) {
    this.loading = true;
    this.selectedSeason = season.seasonName;
    try {
      this.currentPlan = await this.seasonPlannerService.getPlanById(season.seasonInternalId);
      this.loading = false;
    } catch (err) {
      this.loading = false;
    }
  }

  addNewSeason(season) {
    this.modalRef = this.modalService.show(AddRenameSeasonComponent, { ignoreBackdropClick: true });
    this.modalRef.content.AddOrRename = 'Add';
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.season.subscribe((newSeason) => {
      console.log(newSeason);
      this.loading = true;
      this.seasonPlannerService.addSeason(newSeason).subscribe(res => {
        this.loading = false;
        if (res.header.status === 'error') {
          this.toastr.error(res.body.response.msg);
        }
        if (res.header.status === 'success') {
          this.toastr.success(res.body.response.confirmationMessage);
          this.getPlans(this.phaseId);
        }

      }, err => {
        this.loading = false;
        this.toastr.error(DEFAULT_ERROR_MESSAGE);
      });
    });
  }

  deleteSeason(season) {
    this.modalRef = this.modalService.show(ConfirmationModalComponent);
    this.modalRef.content.message = 'Are you sure you want to delete' + season.seasonName + '?';
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.confirmation.subscribe((decision) => {

      if (decision === true) {
        this.loading = true;
        const seasonToDelete = {
          seasonInternalId: season.seasonInternalId,
          athleteId: season.athleteId
        };
        this.seasonPlannerService.deleteSeason(seasonToDelete).subscribe(res => {
          this.loading = false;

          if (res.header.status === 'success') {
            this.toastr.success(res.body.response.confirmationMessage);
            this.getPlans(this.phaseId);
          }

          if (res.header.status === 'error') {
            this.toastr.error(res.body.response.msg);
          }

        }, (err) => {
          this.loading = false;
          this.toastr.error(DEFAULT_ERROR_MESSAGE);
        });
      }
    });
  }

  renameSeason(season) {
    this.modalRef = this.modalService.show(AddRenameSeasonComponent, { ignoreBackdropClick: true });
    this.modalRef.content.AddOrRename = 'Rename';
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.season.subscribe((newSeason) => {
      console.log(newSeason);
      newSeason.seasonPlanId = season.seasonInternalId;
      this.loading = true;
      this.seasonPlannerService.renameSeason(newSeason).subscribe((res) => {
        this.loading = false;
        if (res.header.status === 'success') {
          this.toastr.success(res.body.response.confirmationMessage)
          this.getPlans(this.phaseId);
        }

        if (res.header.status === 'error') {
          this.toastr.error(res.body.response.msg);
        }
      }, (err) => {
        this.loading = false;
        this.toastr.error(DEFAULT_ERROR_MESSAGE);
      });
    });
  }

  async makeLiveSeason(season) {
    // this.toastr.success('Making Season Live...');
    try {
      const res: any = await this.seasonPlannerService.makeLiveSeason(season.seasonInternalId, season.athleteId);
      this.plans.forEach(plan =>
        plan.isThisPrimarySeason = plan.seasonInternalId === season.seasonInternalId ? 'true' : 'false');
      season.isThisPrimarySeason = 'true';
      this.toastr.success(res.body.response.confirmationMessage);
    } catch (err) {
      this.toastr.error(err && err.body && err.body.response && err.body.response.msg || DEFAULT_ERROR_MESSAGE);
    }
  }

  addRace(week) {
    this.router.navigate(['/season-planner/training-phase/add-a-race']);
  }

  goToRace(week) {
    this.router.navigate(['/racex'], { queryParams: {raceId: week.raceData.raceId}});
  }

  deleteRace(week) {
    this.modalRef = this.modalService.show(ConfirmationModalComponent);
    this.modalRef.content.message = `Are you sure you want to delete ${week.raceData.raceName}?`;
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.confirmation.subscribe(async decision => {

      if (!decision) {
        return;
      }

      this.loading = true;

      const raceToDelete = {
        raceId: week.raceData.raceId,
        athleteId: week.raceData.athleteId,
        seasonPlanId: this.currentPlan.seasonInternalId,
        phaseId: week.phaseId,
      };

      try {
        const res: any = await this.seasonPlannerService.deleteRace(raceToDelete);

        if (res.header.status === 'success') {
          this.toastr.success(res.body.response.confirmationMessage);
          this.getPlans(this.phaseId);
        }

        if (res.header.status === 'error') {
          this.toastr.error(res.body.response.msg || DEFAULT_ERROR_MESSAGE);
        }
      } catch (err) {
        this.toastr.error(DEFAULT_ERROR_MESSAGE);
      } finally {
        this.loading = false;
      }
    });
  }

  get isMobile() {
    return getWindowWidth(window) < MOBILE_WIDTH_THRESHOLD;
  }
}
