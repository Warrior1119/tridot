import { Component, OnInit } from '@angular/core';
import { LocalstorageService } from './../common-services/localstorage.service';

@Component({
  selector: 'app-dashboard-race-details',
  templateUrl: './dashboard-race-details.component.html',
  styleUrls: ['./dashboard-race-details.component.scss']
})
export class DashboardRaceDetailsComponent implements OnInit {
  athleteProfile;
  constructor(private localstorageService: LocalstorageService) { }

  ngOnInit() {
    if(localStorage.athleteProfile) {
      this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
    }
  }

}
