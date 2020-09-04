import { Component, OnInit } from '@angular/core';
import Debounce from 'debounce-decorator';
import { LocalstorageService } from '../../athlete-portal/common-services/localstorage.service';
import { DEBOUNCE_INTERVAL_DEFAULT_MS } from "../../athlete-portal/constants/constants";
import { CoachPortalService } from './../coach-portal.service';
import { CommonUtils } from '../../athlete-portal/common-util/common-utils';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
    selector: 'coach-athletes',
    templateUrl: './coach-athletes.component.html',
    styleUrls: ['./coach-athletes.component.scss'],
})
export class CoachAthletesComponent implements OnInit {
  coachProfile: any = {};
  originalCoachAthletes;
  filteredAthletes = [];
  paginatedFilteredAthletes = [];
  loading = false;

  subscriptionFilter: string = 'Premium';
  assignmentStatusFilter: String = 'Assigned to Seat';
  isLinkedAthLoaded = false;
  textFilter: string = '';
  athleteStatusFilter: string = 'Active';
  raceFilter: string = 'All Races';
  raceList = new Set();
  public selectedPage: string | number = 10;

  constructor(private localstorageService: LocalstorageService,
    private coachPortalService: CoachPortalService,
    private modalService: BsModalService
  ) {}

  async ngOnInit() {
    this.coachProfile = this.localstorageService.getCoachProfileIfExists();
    this.originalCoachAthletes = await this.getCoachAthletes();
    this.createRaceListFilterValues();
    this.filterCoachAthletes(this.textFilter, this.subscriptionFilter, this.raceFilter, this.athleteStatusFilter, this.assignmentStatusFilter);
  }

  private createRaceListFilterValues() {
    this.originalCoachAthletes.forEach(coachAthlete => {
      this.addUpcomingRacesToRaceListFilter(coachAthlete);
      this.addPastRacesToRaceListFilter(coachAthlete);
    });
  }

  private addPastRacesToRaceListFilter(coachAthlete: any) {
    if (coachAthlete.pastRaces) {
      coachAthlete.pastRaces.forEach(race => {
        if (race) {
          this.raceList.add(race.raceEventDetails.raceName);
        }
      });
    }
  }

  private addUpcomingRacesToRaceListFilter(coachAthlete: any) {
    if (coachAthlete.upcomingRaces) {
      coachAthlete.upcomingRaces.forEach(race => {
        if (race) {
          this.raceList.add(race.raceEventDetails.raceName);
        }
      });
    }
  }

  private async getCoachAthletes(): Promise<any> {
    this.loading = true;
    try {
      return await this.coachPortalService.getCoachAthletes(this.coachProfile.coachId, this.assignmentStatusFilter).toPromise();
    } catch (error) {
      CommonUtils.defaultErrorModalMessage(this.modalService);
      return Promise.resolve([]);
    } finally {
      this.loading = false;
    }
  }

  public get availableSeatsInfo() {
    if (this.coachProfile.totalAvailableSeats < 100) {
      return (this.coachProfile.totalAvailableSeats - this.coachProfile.assignedToSeatCount) + ' / ' + this.coachProfile.totalAvailableSeats;
    } else {
      return null;
    }
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  fireSearch() {
    this.filterByText(this.textFilter);
  }

  public filterByText(textFilter: string): void {
    this.textFilter = textFilter;
    this.filterCoachAthletes(this.textFilter, this.subscriptionFilter, this.raceFilter, this.athleteStatusFilter, this.assignmentStatusFilter);
  }

  public filterBySubscription(subscriptionFilter: string): void {
    this.subscriptionFilter = subscriptionFilter;
    this.filterCoachAthletes(this.textFilter, this.subscriptionFilter, this.raceFilter, this.athleteStatusFilter, this.assignmentStatusFilter);
  }

  public filterByRace(raceFilter: string): void {
    this.raceFilter = raceFilter;
    this.filterCoachAthletes(this.textFilter, this.subscriptionFilter, this.raceFilter, this.athleteStatusFilter, this.assignmentStatusFilter);
  }

  public filterByAthleteStatus(athleteStatusFilter: string): void {
    this.athleteStatusFilter = athleteStatusFilter;
    this.filterCoachAthletes(this.textFilter, this.subscriptionFilter, this.raceFilter, this.athleteStatusFilter, this.assignmentStatusFilter);
  }

  public async filterByAthleteAssignStatus(assignmentStatus: String) {
    this.assignmentStatusFilter = assignmentStatus;
    if(!this.isLinkedAthLoaded && assignmentStatus === 'Linked') {
      this.originalCoachAthletes = this.originalCoachAthletes.concat(await this.getCoachAthletes());
      this.isLinkedAthLoaded = true;
    }
    this.filterCoachAthletes(this.textFilter, this.subscriptionFilter, this.raceFilter, this.athleteStatusFilter, this.assignmentStatusFilter);
  }

  public filterCoachAthletes(textFilter: string, subscriptionFilter: string, raceFilter: string, athleteStatusFilter: string, assignmentStatusFilter: String): void {
    this.filteredAthletes = Object.assign([], this.originalCoachAthletes);
    this.filteredAthletes = this.filteredAthletes.filter(coachAthlete => {
      let isFilterMatch = true;
      isFilterMatch = this.filterByTextFilter(textFilter, coachAthlete, isFilterMatch);
      isFilterMatch = this.filterBySubscriptionName(subscriptionFilter, isFilterMatch, coachAthlete);
      isFilterMatch = this.filterByRaceSelection(raceFilter, isFilterMatch, coachAthlete);
      isFilterMatch = this.filterBySubscriptionStatus(athleteStatusFilter, isFilterMatch, coachAthlete);
      isFilterMatch = this.filterByAthletAssignmentStatus(assignmentStatusFilter, isFilterMatch, coachAthlete);
      return isFilterMatch;
    });
    this.paginate(this.selectedPage);
  }

  private filterByTextFilter(textFilter: string, coachAthlete: any, isFilterMatch: boolean) {
    if (textFilter && textFilter.trim() !== '') {
      const fullName = CommonUtils.toLowerCase(coachAthlete.firstName) + ' ' + CommonUtils.toLowerCase(coachAthlete.lastName);
      const email = CommonUtils.toLowerCase(coachAthlete.email);
      isFilterMatch = fullName.indexOf(textFilter.toLowerCase()) !== -1 || email.indexOf(textFilter.toLowerCase()) !== -1;
    }
    return isFilterMatch;
  }

  private filterBySubscriptionName(subscriptionFilter: string, isFilterMatch: boolean, coachAthlete: any) {
    if (subscriptionFilter !== 'All Levels' && isFilterMatch) {
      isFilterMatch = CommonUtils.toLowerCase(subscriptionFilter) === CommonUtils.toLowerCase(coachAthlete.subscriptionName) &&
                      CommonUtils.toLowerCase('Linked to Coach') !== CommonUtils.toLowerCase(coachAthlete.assignmentStatus);
    }
    return isFilterMatch;
  }

  private filterByRaceSelection(raceFilter: string, isFilterMatch: boolean, coachAthlete: any) {
    if (raceFilter !== 'All Races' && isFilterMatch) {
      let isUpcomingRaceMatch = false;
      let isPastRaceMatch = false;
      if (coachAthlete.upcomingRaces) {
        isUpcomingRaceMatch = coachAthlete.upcomingRaces.find(race => race.raceEventDetails.raceName === raceFilter);
      }
      if (coachAthlete.pastRaces) {
        isPastRaceMatch = coachAthlete.pastRaces.find(race => race.raceEventDetails.raceName === raceFilter);
      }
      isFilterMatch = isUpcomingRaceMatch || isPastRaceMatch;
    }
    return isFilterMatch;
  }

  private filterBySubscriptionStatus(athleteStatusFilter: string, isFilterMatch: boolean, coachAthlete: any) {
    if (athleteStatusFilter !== 'All Status' && isFilterMatch) {
      isFilterMatch = CommonUtils.toLowerCase(athleteStatusFilter) === CommonUtils.toLowerCase(coachAthlete.subscriptionStatus);
    }
    return isFilterMatch;
  }

  public filterByAthletAssignmentStatus(assignmentStatusFilter, isFilterMatch, coachAthlete) {
    if (assignmentStatusFilter !== 'Assigned to Seat' && isFilterMatch) {
      isFilterMatch = CommonUtils.toLowerCase('Linked to Coach') === CommonUtils.toLowerCase(coachAthlete.assignmentStatus);
    }
    return isFilterMatch;
  }

  public paginate(selectedPage: string | number): void {
    this.selectedPage = selectedPage;
    if (selectedPage === 'ALL') {
      this.paginatedFilteredAthletes = Object.assign([], this.filteredAthletes);
    } else {
      this.paginatedFilteredAthletes = this.filteredAthletes.slice(0, +selectedPage);
    }
  }
}
