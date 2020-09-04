
import {fromEvent as observableFromEvent } from 'rxjs';

import {map, distinctUntilChanged, debounceTime, tap} from 'rxjs/operators';
import { Component, OnInit, EventEmitter, ViewChild,Input, ElementRef, AfterViewInit, Output, ChangeDetectorRef } from '@angular/core';
import { DashboardServiceService } from "../../../athlete-portal/common-services/dashboard-service.service";
@Component({
  selector: 'app-refer-coach',
  templateUrl: './refer-coach.component.html',
  styleUrls: ['./refer-coach.component.scss']
})
export class ReferCoachComponent implements OnInit, AfterViewInit {
  selected: string;
  searchResults = [];
  coach;
  @Input() displayModal;
  @Output() decision = new EventEmitter();

  @ViewChild('debounceSearch') text: ElementRef;
  loading;

  constructor(
    private cd: ChangeDetectorRef,
    private dashboardService: DashboardServiceService
  ) {}

  search(query) {
    if (query == "") {
      this.searchResults = [];
      this.cd.detectChanges();
    }
    this.getResults(query);
  }

  onCoachSelect(coach) {
    this.coach = coach.item;
    console.log(this.coach);
  }

  getResults(search) {
    this.loading = true;
    this.dashboardService.getCoaches(search).subscribe(res => {
      console.log(res.body.response);
      if (res.header.status === 'success') {
        this.searchResults = res.body.response;
        this.searchResults.map(coach => coach.fullName = coach.firstName + ' ' + coach.lastName);
        this.cd.detectChanges();
      }
      this.loading = false;
    }, (err) => {
      this.loading = false;
      console.error(err);
    });
  }

  closeModal() {
    this.displayModal.hide();
  }

  save(decision) {
    if (decision == 'coach') {
      this.decision.next(this.coach.coachId);
      this.closeModal();
    } else {
      this.decision.next(decision)
      this.closeModal();
    }
  }

  ngOnInit() {
    this.dashboardService.getCoaches('assignedCoach').subscribe(res => { 
      if (res.header.status === 'success') {
        const coaches = res.body.response;
        if (coaches && coaches.length > 0) {
            const assignedCoach = coaches[0];
            this.coach = assignedCoach;
            this.selected = assignedCoach.firstName + ' ' + assignedCoach.lastName;
        }
      }
      this.loading = false;
    }, (err) => {
      this.loading = false;
      console.error(err);
    });
  }

  ngAfterViewInit() {
    observableFromEvent(this.text.nativeElement, 'keyup').pipe(
      tap(() => console.log("keyup")),
      debounceTime(500),
      distinctUntilChanged(),
      map(() => this.search(this.selected)),)
      .subscribe(res => console.log(res));
  }

}
