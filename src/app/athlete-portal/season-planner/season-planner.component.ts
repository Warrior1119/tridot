import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SeasonPlannerService } from './season-planner.service';
import { Router } from '@angular/router';
import { AddRenameSeasonComponent } from './add-rename-season/add-rename-season.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ConfirmationModalComponent } from './../common-components/confirmation-modal/confirmation-modal.component';
import { DEFAULT_ERROR_MESSAGE, MOBILE_WIDTH_THRESHOLD } from '../constants/constants';
import { ToastrService } from 'ngx-toastr';
import { getWindowWidth } from '../../utils/browser';

@Component({
  selector: 'app-season-planner',
  templateUrl: './season-planner.component.html',
  styleUrls: ['./season-planner.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SeasonPlannerComponent implements OnInit {
  plans;
  selectedSeason;
  loading;
  currentPlan;
  modalRef: BsModalRef;
  alerts: any[] = [];
  
  constructor(
    private seasonPlannerService: SeasonPlannerService,
    private router: Router,
    private modalService: BsModalService,
    private toastr: ToastrService,
  ) {}

  async getPlans() {
    this.loading = true;
    try {
      this.plans = await this.seasonPlannerService.getPlans();
      this.currentPlan = this.plans.find(plan => plan.isThisPrimarySeason === 'true');
      console.log(this.currentPlan);
    } catch (err) {
      console.error(err);
    } finally {
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
          this.getPlans();
        }

      }, err => {
        this.loading = false;
        this.toastr.error(DEFAULT_ERROR_MESSAGE);
      });
    });
  }

  canDeleteSeason(season) {
    return season && season.isThisPrimarySeason != 'true';
  }

  deleteSeason(season) {
    this.modalRef = this.modalService.show(ConfirmationModalComponent);
    this.modalRef.content.message = `Are you sure you want to delete ${season.seasonName}?`;
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.confirmation.subscribe(async decision => {

      if (!decision) {
        return;
      }

      this.loading = true;

      const seasonToDelete = {
        seasonInternalId: season.seasonInternalId,
        athleteId: season.athleteId
      };

      try {
        const res = await this.seasonPlannerService.deleteSeason(seasonToDelete).toPromise();

        if (res.header.status === 'success') {
          this.toastr.success(res.body.response.confirmationMessage);
          this.getPlans();
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
          this.toastr.success(res.body.response.confirmationMessage);
          this.getPlans();
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

  async getPlanById(season) {
    this.loading = true;
    this.selectedSeason = season.seasonName;
    try {
      this.currentPlan = await this.seasonPlannerService.getPlanById(season.seasonInternalId);
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  getRaces() {
    this.seasonPlannerService.getRaces().subscribe(res => {
      console.log('Race=> ' + res);
    });
  }

  ngOnInit() {
    this.getPlans();
  }

  deleteRace(week) {

    const childRacesB = week.raceData.childRaces && week.raceData.childRaces.filter(x => x.raceCategory === 'B');

    this.modalRef = this.modalService.show(ConfirmationModalComponent);
    this.modalRef.content.message = `Are you sure you want to delete ${week.raceData.raceName}?`;

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
          this.getPlans();
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
