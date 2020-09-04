import * as moment from 'moment';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RaceXService } from './race-x.service';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmationModalComponent } from '../common-components/confirmation-modal/confirmation-modal.component';
import { RaceXSurveyComponent } from './race-x-survey/race-x-survey.component';
import { SeasonPlannerService } from '../season-planner/season-planner.service';
import { MessageModalComponent } from '../common-components/message-modal/message-modal.component';
import { getWindowWidth } from '../../utils/browser';
import { MOBILE_WIDTH_THRESHOLD } from '../constants/constants';
import { CommonUtils } from '../common-util/common-utils';

@Component({
  selector: 'app-race-x',
  templateUrl: './race-x.component.html',
  styleUrls: ['./race-x.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class RaceXComponent implements OnInit {
  futureRaces;
  pastRaces;
  selectedRace;
  raceDetails;
  raceDetailsBusy = true;
  raceNutrition = {} as any;
  alerts: any[] = [];
  modalRef: BsModalRef;
  modalRefSurvey: BsModalRef;
  showBottomSurvey = true;
  selectedRaceAnySurveyFilled = false;
  nutritionImportSources: any[];
  currentPlan;
  canDeleteRace = true;
  raceXModalRef;
  loading = false;

  constructor(
    private racexService: RaceXService,
    private seasonPlannerService: SeasonPlannerService,
    private router: Router,
    private modalService: BsModalService,
  ) { }
  createModelMessageJson(message) {
    return { "header": { "status": "success" }, "body": { "response": { "msg": message } } }
  }
  showModalMessage(res, err) {

    this.modalRef = this.modalService.show(MessageModalComponent);
    this.modalRef.content.displayModal = this.modalRef;
    if (res != null) {
      this.modalRef.content.parseAndSetBackendResponse(res);
    } else {
      this.modalRef.content.showException(err);
    }


    this.modalRef.content.confirmation.subscribe((decision) => {

    });

  }

  async getRaces() {
    try {
      const res = await this.racexService.getRaces().toPromise();
      this.futureRaces =
        res.body.response.futureRace.filter(x => !this.currentPlan || (x.seasonId == this.currentPlan.seasonInternalId))
          .concat(res.body.response.pastRaces); // display past races from all seasons
      this.pastRaces = res.body.response.pastRaces;
      this.futureRaces.sort((a, b) => moment(b.raceDate, "MM/DD/YYYY").toDate().getTime() - moment(a.raceDate, "MM/DD/YYYY").toDate().getTime());
      this.pastRaces.sort((a, b) => moment(b.raceDate, "MM/DD/YYYY").toDate().getTime() - moment(a.raceDate, "MM/DD/YYYY").toDate().getTime());

      if (this.futureRaces.length > 0) {
        this.updateRace(this.futureRaces[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  hasNextRace() {
    if (!this.futureRaces) {
      return false;
    }
    const index = this.futureRaces.indexOf(this.selectedRace);
    if (index === -1) {
      return false;
    }
    if (index === this.futureRaces.length - 1) {
      return false;
    }
    return true;
  }

  hasPrevRace() {
    if (!this.futureRaces) {
      return false;
    }
    const index = this.futureRaces.indexOf(this.selectedRace);
    if (index === -1) {
      return false;
    }
    if (index === 0) {
      return false;
    }
    return true;
  }

  onNextRace() {
    const index = this.futureRaces.indexOf(this.selectedRace);
    if (index === -1) {
      return;
    }
    if (index === this.futureRaces.length - 1) {
      return;
    }
    this.updateRace(this.futureRaces[index + 1]);
  }

  onPrevRace() {
    const index = this.futureRaces.indexOf(this.selectedRace);
    if (index === -1) {
      return;
    }
    if (index === 0) {
      return;
    }
    this.updateRace(this.futureRaces[index - 1]);
  }

  async importNutritionDataFrom({ raceId, raceName }: { raceId: string, raceName: string }) {
    this.modalRef = this.modalService.show(ConfirmationModalComponent);
    this.modalRef.content.message = `Importing from <strong>${raceName}</strong> will overwrite all nutritional data you've entered for <i>all disciplines</i> in this race.<br />Would you like to continue?`;
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.confirmation.subscribe(async decision => {

      if (!decision) {
        return;
      }

      try {
        const res = await this.racexService.importNutritionData(raceId, this.selectedRace.raceId).toPromise();
        if (res.header.status === 'error') {
          this.showModalMessage(res, null);
          return;
        }


        this.canDeleteRace = this.selectedRace.daysTillRace != 0;
        this.getRaceDetails(this.selectedRace.raceId);
        this.getNutrition(this.selectedRace.raceId);
        this._getNutritionImportSources(this.pastRaces, this.selectedRace);
        this.showModalMessage(res, null);
      } catch (err) {
        this.showModalMessage(null, err);

      }
    });
  }

  async updateRace(race) {
    this.selectedRace = race;
    this.canDeleteRace = race.daysTillRace != 0;
    await this.getRaceDetails(this.selectedRace.raceId);
    this.showBottomSurvey = true;
    await this.getNutrition(this.selectedRace.raceId);
    this._getNutritionImportSources(this.pastRaces, this.selectedRace);
  }

  async getRaceDetails(id: string) {

    try {
      this.raceDetailsBusy = true;
      this.raceDetails = await this.racexService.raceDetails(id);
      this.selectedRaceAnySurveyFilled = this._anySurveyFilled(this.raceDetails);
    } finally {
      this.raceDetailsBusy = false;
    }

  }

  async getNutrition(id: string) {
    this.raceNutrition = await this.racexService.getNutrition(id);
  }

  async updateRaceX(body) {
    //this.raceXModalRef = CommonUtils.modalMessage('Updating RaceX', 'Please wait while we update the race and update your RaceX page.', this.modalRefSurvey, 'loading', this.modalService, null);
    try {
      const res: any = await this.racexService.update(body);
      if (res.header && res.header.status === 'error') {
        this.showModalMessage(res, null);
      }
      this.canDeleteRace = body.daysTillRace != 0;
      await this.getRaceDetails(body.raceId);
      await this.getNutrition(body.raceId);
      this._getNutritionImportSources(this.pastRaces, body);
     // this.raceXModalRef.modalRef.hide();

    } catch (err) {
      console.error(err);
      // this.raceXModalRef.modalRef.hide();
      CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg ||'Something went wrong', this.modalRef, 'error', this.modalService, 'DISMISS');
    }
  }

  async ngOnInit() {
    this.loading = true;
    try {
      const plans = await this.seasonPlannerService.getPlans();
      this.currentPlan = plans.find(plan => plan.isThisPrimarySeason === 'true');
    } catch (e) {
      console.error(e);
    }
    await this.getRaces();
  }

  submitSurvey() {
    this.showModalMessage(this.createModelMessageJson("Thank you. Data submitted successfully"), null
    )
  }

  openSurveyModal() {
    const initialState = {
      race: this.selectedRace,
      details: this.raceDetails,
      showSubmitButton: true
    };
    this.modalRefSurvey = this.modalService.show(RaceXSurveyComponent, {
      class: 'modal-race-x-survey', initialState, backdrop: false,
      ignoreBackdropClick: false
    });
    this.modalRefSurvey.content.displayModal = this.modalRefSurvey;
    this.modalRefSurvey.content.updateRaceX.subscribe($event => this.updateRaceX($event));
    this.modalRefSurvey.content.submit.subscribe(() => this.submitSurvey());
  }

  deleteRace() {

    // Lookup week which contains current race
    let week;
    this.currentPlan.rowData.forEach(x => x.forEach(x => x.forEach(x => {
      if (
        x.raceData
        && x.raceData.raceName === this.raceDetails.raceEventDetails.raceName
        && moment(x.raceData.raceDate).toDate().valueOf() == new Date(this.raceDetails.raceEventDetails.raceDateInStandard).valueOf()
      ) {
        week = x;
      }
    })));

    const childRacesB = week.raceData.childRaces && week.raceData.childRaces.filter(x => x.raceCategory === 'B');

    this.modalRef = this.modalService.show(ConfirmationModalComponent);
    this.modalRef.content.message = `<p>Are you sure you want to delete ${week.raceData.raceName}?</p>
    <p>You may not be able to add this race again, based on how far out, current long sessions, or other factors</p>
    `;

    if (childRacesB && childRacesB.length) {
      this.modalRef.content.alert =
        `This is an A race. Related B races will be DELETED:
          \r\n<br />${childRacesB.map(x => x.raceName).join('\r\n<br />')}`;
    }
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.confirmation.subscribe(async decision => {

      if (!decision) {
        return;
      }

      const raceToDelete = {
        raceId: week.raceData.raceId,
        athleteId: week.raceData.athleteId,
        seasonPlanId: this.currentPlan.seasonInternalId,
        phaseId: week.phaseId,
      };

      try {
        await this.seasonPlannerService.deleteRace(raceToDelete);
        this.router.navigate(['/season-planner']);
      } catch (err) {
        console.error(err);
      }
    });
  }

  private _anySurveyFilled(details) {
    const NOT_SET_STATE = 2;
    if (details) {
      return details.uiRaceDetails.isFirstRaceOfDistance !== NOT_SET_STATE
        || details.uiRaceDetails.qualifyingPerformance !== NOT_SET_STATE
        || details.uiRaceDetails.qualifyingReason !== 'na'
        || details.uiRaceDetails.dnsDnf
        || details.uiRaceDetails.goal1
        || details.uiRaceDetails.goal2
        || details.uiRaceDetails.goal3
        || details.uiRaceDetails.goal1Success !== NOT_SET_STATE
        || details.uiRaceDetails.goal2Success !== NOT_SET_STATE
        || details.uiRaceDetails.goal3Success !== "2"
        || details.uiRaceDetails.overallRaceSuccess !== NOT_SET_STATE
        ;
    }
  }

  private _getNutritionImportSources(pastRaces, race) {
    if (!pastRaces || !race) {
      return;
    }
    this.nutritionImportSources = pastRaces.filter(pastRace => pastRace.raceDistanceName === race.raceDistanceName);
  }

  get isMobile() {
    return getWindowWidth(window) < MOBILE_WIDTH_THRESHOLD;
  }
}
