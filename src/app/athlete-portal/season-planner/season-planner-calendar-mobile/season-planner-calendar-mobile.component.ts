import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { RaceDetailsMobileComponent } from '../race-details-mobile/race-details-mobile.component';

@Component({
  selector: 'season-planner-calendar-mobile',
  templateUrl: './season-planner-calendar-mobile.component.html',
  styleUrls: ['./season-planner-calendar-mobile.component.scss']
})
export class SeasonPlannerCalendarMobileComponent implements OnInit {
  @Input() currentPlan;
  @Output('deleteRace') delete = new EventEmitter();

  modalRef: BsModalRef;

  page = 1;
  selectedWeek;
  private _hoverPhaseId: number;

  constructor(private router: Router, private modalService: BsModalService) { }

  ngOnInit() {
    console.log('currentPlan', this.currentPlan);
  }

  setWeek(week) {
    this.selectedWeek = week;
  }

  getPhaseBorder(week) {
    const phase = this.currentPlan.phases.find(({ phaseId }) => phaseId == week.phaseId);
    if (phase.races.some(({ raceType }) => raceType === 'Development')) {
      return 'dev-phase';
    }
    if (phase.races.some(({ raceType }) => raceType === 'Race Prep')) {
      return 'prep-phase';
    }
    return 'no-phase';
  }

  goToTrainingPhase(week) {
    this.router.navigate(['/season-planner/training-phase'], { queryParams: { phaseId: week.phaseId } });
  }

  addRace(week) {
    this.router.navigate(['/season-planner/training-phase/add-a-race']);
  }

  goToRace(week) {
    const initialState = { race: week.raceData };
    this.modalRef = this.modalService.show(RaceDetailsMobileComponent, {
      class: 'modal-lg race-details-modal', initialState, backdrop: false
    });
    this.modalRef.content.displayModal = this.modalRef;
    this.modalRef.content.action.subscribe(action => {
      if (action === 'delete') {
        this.deleteRace(week);
      } else if (action === 'view') {
        this.router.navigate(['/racex'], { queryParams: {raceId: week.raceData.raceId}});
        this.modalRef.hide();
      }
    });
  }

  deleteRace(week) {
    this.delete.emit(week);
  }
}
