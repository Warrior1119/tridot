import * as moment from 'moment';
import { Component, OnInit, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { SeasonPlannerService } from '../season-planner.service';
import { raceCategory } from '../season-shared-data.service';
import { Router } from '@angular/router';
import { AddRenameSeasonComponent } from '../add-rename-season/add-rename-season.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ConfirmationModalComponent, ModalType } from '../../common-components/confirmation-modal/confirmation-modal.component';
import { DEFAULT_ERROR_MESSAGE, BS_DATEPICKER_DEFAULTS, MOBILE_WIDTH_THRESHOLD } from '../../constants/constants';
import { UserProfileService } from '../../user/user-profile/user-profile.service';
import { ToastrService } from 'ngx-toastr';
import { AddARaceFormMobileComponent } from '../add-a-race-form-mobile/add-a-race-form-mobile.component';
import { getWindowWidth, isMobileSafari } from '../../../utils/browser';
import { PLACEHOLDER_DD_MM_YYYY } from '../../constants/date-time.constants';

@Component({
  selector: 'app-add-a-race',
  templateUrl: './add-a-race.component.html',
  styleUrls: ['./add-a-race.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddARaceComponent implements OnInit {
  profile;

  plans: any[];
  selectedSeason;
  loading;
  loadingRace = false;
  currentPlan;
  selectedWeek;
  allRaceCategories = raceCategory;
  raceCategories: any[];
  selectedRace;
  full_address;
  address;

  private selectedRaceTab;
  private selectedRaceCategory;

  alerts: any[] = [];

  @ViewChild('seasonMenu', { read: ElementRef }) seasonMenu;
  @ViewChild(AddARaceFormMobileComponent) addARaceForm;

  modalRef: BsModalRef;
  startDate = moment().startOf('day').toDate();
  minDate = moment().startOf('day').toDate();
  endDate = moment().startOf('day').toDate();
  minEndDate = moment().startOf('day').toDate();
  selectedDate = moment().startOf('day').toDate();
  unlistedRace;
  isUnlistedRace: boolean;
  colorTheme = 'theme-green';
  selectedPhase;
  availableRaces = [];

  private _hoverPhaseId: number;

  constructor(
    private modalService: BsModalService,
    private seasonPlannerService: SeasonPlannerService,
    private userProfileService: UserProfileService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  get prefDateFormatLong () {
    return this.profile && this.profile.prefDateFormat === PLACEHOLDER_DD_MM_YYYY
      ? 'D MMMM, YYYY'
      : 'MMMM D, YYYY';
  }

  getProfile() {
    this.userProfileService.profile().subscribe((res) => {
      this.profile = res.body.response.athleteProfile;
      console.log(this.profile);
    }, (err)=> {
      console.error(err);
    })
  }

  get noRace() {
    return !this.profile || !this.profile.firstRace;
  }

  setHoverPhase(data) {
    this._hoverPhaseId = data && data[0] && data[0].phaseId;
  }

  removeHoverPhase() {
    this._hoverPhaseId = null;
  }

  isHoverPhase(data) {
    return this._hoverPhaseId == (data && data[0] && data[0].phaseId);
  }

  setWeek(week) {
    this.selectedWeek = week;
  }

  public racePriorityChanged(value: string): void {
    this.selectedRaceTab = value;
  }

  public raceCategoryChanged(value: string): void {
    this.selectedRaceCategory = value;
  }

  endDateChange(date) {
    console.log(date);
  }

  addNewSeason() {
    this.modalRef = this.modalService.show(AddRenameSeasonComponent, { backdrop: isMobileSafari() ? 'static' : true });
    this.modalRef.content.AddOrRename = 'Add'
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.season.subscribe((newSeason) => {
      console.log(newSeason);
      this.loading = true;
      this.seasonPlannerService.addSeason(newSeason).subscribe(res => {
        this.loading = false;
        if (res.header.status === 'error') {
          // this.toastr.error(res.body.response.msg);
          this.showErrorModal(res.body.response.msg);
        }
        if (res.header.status === 'success') {
          // this.toastr.success(res.body.response.confirmationMessage);
          this.showSuccessModal(res.body.response.confirmationMessage);
          this.getPlans();
        }
      }, err => {
        this.loading = false;
        // this.toastr.error(DEFAULT_ERROR_MESSAGE);
        this.showErrorModal(DEFAULT_ERROR_MESSAGE);
      });
    });
  }

  deleteSeason(season) {
    this.modalRef = this.modalService.show(ConfirmationModalComponent);
    this.modalRef.content.message = 'Are you sure you want to delete ' + season.seasonName + "?";
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.confirmation.subscribe((decision) => {

      if (decision == true) {
        this.loading = true;
        let seasonToDelete = {
          seasonInternalId: season.seasonInternalId,
          athleteId: season.athleteId
        }
        this.seasonPlannerService.deleteSeason(seasonToDelete).subscribe(res => {
          this.loading = false;

          if (res.header.status === 'success') {
            // this.toastr.success(res.body.response.confirmationMessage);
            this.showSuccessModal(res.body.response.confirmationMessage);
            this.getPlans();
          }

          if (res.header.status === 'error') {
            // this.toastr.error(res.body.response.msg);
            this.showErrorModal(res.body.response.msg);
          }

        }, (err) => {
          this.loading = false;
          // this.toastr.error(DEFAULT_ERROR_MESSAGE);
          this.showErrorModal(DEFAULT_ERROR_MESSAGE);
        })
      }
    });
  }

  renameSeason(season) {
    this.modalRef = this.modalService.show(AddRenameSeasonComponent, { ignoreBackdropClick: true });
    this.modalRef.content.AddOrRename = 'Rename'
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.season.subscribe((newSeason) => {
      console.log(newSeason);
      newSeason.seasonPlanId = season.seasonInternalId;
      this.loading = true;
      this.seasonPlannerService.renameSeason(newSeason).subscribe((res) => {
        this.loading = false;
        if (res.header.status === 'success') {
          // this.toastr.success(res.body.response.confirmationMessage);
          this.showSuccessModal(res.body.response.confirmationMessage);
          this.getPlans();
        }

        if (res.header.status === 'error') {
          // this.toastr.error(res.body.response.msg);
          this.showErrorModal(res.body.response.msg);
        }
      }, (err) => {
        this.loading = false;
        // this.toastr.error(DEFAULT_ERROR_MESSAGE);
        this.showErrorModal(DEFAULT_ERROR_MESSAGE);
      })
    });
  }

  async makeLiveSeason(season) {
    // this.toastr.success('Making Season Live...');
    try {
      const res: any = await this.seasonPlannerService.makeLiveSeason(season.seasonInternalId, season.athleteId);
      this.plans.forEach(plan =>
        plan.isThisPrimarySeason = plan.seasonInternalId === season.seasonInternalId ? 'true' : 'false');
      season.isThisPrimarySeason = 'true';
      // this.toastr.success(res.body.response.confirmationMessage);
      this.showSuccessModal(res.body.response.confirmationMessage);
    } catch (err) {
      this.toastr.error(err && err.body && err.body.response && err.body.response.msg || DEFAULT_ERROR_MESSAGE);
    }
  }

  getColorStatus(week) {
    const selector = this.selectedRaceTab && this.selectedRaceTab === 'C'
      ? week.cRaceAvailStatus
      : this.selectedRaceCategory && week[this.selectedRaceTab.toLowerCase() + 'RaceAvailStatus_' + this.selectedRaceCategory.catId];
    switch (selector) {
      case 'green': return 'avail';
      case 'orange': return 'not-opt';
      case 'red': return 'not-avail';
      default: return 'avail';
    }
  }

  public addRace(race): void {
    this.loadingRace = true;
    race.athleteId =  this.currentPlan.athleteId;
    race.seasonId = this.currentPlan.seasonInternalId;
    this.seasonPlannerService.addRace(race).subscribe((res) => {
      if (res.header.status === 'success') {
        // this.toastr.success(res.body.response.confirmationMessage);
        this.showSuccessModal(res.body.response.confirmationMessage);
        this.getPlans();
        setTimeout(() => window.history.back(), 1000);
      } else if (res.header.status === 'error') {
        // this.toastr.error(res.body.response.msg);
        this.showErrorModal(res.body.response.msg);
      }
      this.loadingRace = false;
    }, (err) => {
      this.loadingRace = false;
      // this.toastr.error(DEFAULT_ERROR_MESSAGE);
      this.showErrorModal(DEFAULT_ERROR_MESSAGE);
      console.error('Error while adding a race', err);
    });
  }

  async getPlans() {
    this.loading = true;
    try {
      this.plans = await this.seasonPlannerService.getPlans();

      this.currentPlan = this.plans.find(plan => plan.isThisPrimarySeason == 'true') || this.plans[0];

      this.loading = false;
    } catch (err) {
      this.loading = false;
      console.error(err);
    }
  }

  getPhaseBorder(rows) {
    const phase = this.currentPlan.phases.filter(phase => phase.phaseId == rows.phaseId)[0];

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

  add(): void {

  }

  goback() {
    window.history.back();
  }

  async ngOnInit() {
    this.getPlans();
    this.getProfile();
  }

  async noScheduledRace() {
    await this.userProfileService.noScheduledRace(this.profile.athleteId);
    this.profile.firstRace = 1;
    localStorage.athleteProfile = JSON.stringify(this.profile);
    this.router.navigate(['/']);
  }

  upgrade() {
    this.router.navigate(['/user/subscription-options']);
  }

  showSuccessModal(message: string) {
    this._displayModal('success', message, null, 'Confirm');
  }

  showErrorModal(message: string) {
    this._displayModal('error', message, null, 'DISMISS');
  }

  private _displayModal(
    modalType: ModalType,
    message: string,
    modalTitle: string = 'Error',
    successBtnTxt: string = 'OK'
  ) {
    const initialState = {
      modalType,
      modalTitle,
      message,
      successBtnTxt,
    };
    this.modalRef = this.modalService.show(ConfirmationModalComponent, { initialState });
    this.modalRef.content.displayModal = this.modalRef;
  }

  get isMobile() {
    return getWindowWidth(window) < MOBILE_WIDTH_THRESHOLD;
  }
}
