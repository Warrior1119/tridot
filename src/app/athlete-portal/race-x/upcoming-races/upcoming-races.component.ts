import { Component, Input, Output, OnInit, ViewEncapsulation, EventEmitter } from '@angular/core';

import { UpcomingRacesService } from './upcoming-races.service';

@Component({
  selector: 'app-upcoming-races',
  templateUrl: './upcoming-races.component.html',
  styleUrls: ['./upcoming-races.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UpcomingRacesComponent implements OnInit {

  @Input() public race;
  @Input() public details;
  @Output() selectedRace = new EventEmitter();
  public races;
  public futureRaces = [];
  constructor(
    private upcomingRacesService: UpcomingRacesService
  ) { }

  async ngOnInit() {
    this.races = await this.upcomingRacesService.getRaces();
    this.futureRaces = this.races.futureRace.slice(0, 3);
  }
  updateRace(race) {
    this.race = race;
    this.selectedRace.next(race);
  }

}

