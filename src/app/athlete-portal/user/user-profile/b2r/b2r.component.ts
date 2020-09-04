import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '../user-profile.service';
import * as moment from 'moment';
import { LocalstorageService } from './../../../common-services/localstorage.service';

@Component({
  selector: 'app-b2r',
  templateUrl: './b2r.component.html',
  styleUrls: ['./b2r.component.scss']
})
export class B2rComponent implements OnInit {

  athleteProfile: any;
  b2RFactor;
  
  tsp;
  loading = false;

  constructor(private userProfileService: UserProfileService,
              private localstorageService: LocalstorageService,) { 
    this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
    this.b2RFactor = this.athleteProfile.b2rFactor === 'true';
  }

  getTSP() {
    this.userProfileService.tsp().subscribe((res) => {
      this.tsp = res.body.response;
    });
  }
  ngOnInit() {
    this.getTSP();
  }

  getTotalScore() {
    if (this.tsp) {
      return this.tsp.bikeToRunFactorOverall;
    }
    return 0;
  }

  getTridotsScore() {
    if (this.tsp) {
      return this.tsp.bikeToRunTridots;
    }
    return 0;
  }

  getSportsAgeScore() {
    if (this.tsp) {
      return this.tsp.bikeToRunSportAge;
    }
    return 0;
  }

  getFTHRScore() {
    if (this.tsp) {
      return this.tsp.bikeToRunFthr;
    }
  }

  isEmptyForBike(max, index, score) {
    if (-(max - index - 1) > score) {
      return false;
    } else {
      return true;
    }
  }

  isEmptyForRun(index, score) {
    if (index < score) {
      return false;
    } else {
      return true;
    }
  }

  updateB2R(value) {
    if (this.b2RFactor !== value) {
      this.b2RFactor = value;
      this._update();
    }
  }

  private _update() {
    const profile = Object.assign({}, this.athleteProfile);
    profile.b2rFactor = this.b2RFactor;
    if (profile.swimStartDate) {
      profile.swimStartDate = moment(profile.swimStartDate).format('l');
    }
    if (profile.runStartDate) {
      profile.runStartDate = moment(profile.runStartDate).format('l');
    }
    if (profile.dob) {
      profile.dob = moment(profile.dob).format('l');
    }
    if (profile.bikeStartDate) {
      profile.bikeStartDate = moment(profile.bikeStartDate).format('l');
    }
    this.loading = true;
    this.userProfileService.save(profile).subscribe(res => {
      console.log(res);
      localStorage.athleteProfile = JSON.stringify(profile);
      this.athleteProfile = profile;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.b2RFactor = !this.b2RFactor;
    });
  }
}
