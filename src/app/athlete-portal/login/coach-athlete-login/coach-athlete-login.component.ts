import { Component, OnInit } from '@angular/core';
import { OnboardService } from '../../../onboard/onboard.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorage } from '../../common-services/local-storage';

@Component({
  selector: 'app-coach-athlete-login',
  templateUrl: './coach-athlete-login.component.html',
  styleUrls: ['./coach-athlete-login.component.scss']
})
export class CoachAthleteLoginComponent implements OnInit {

  athleteId;
  accessToken;
  constructor(
    private onboardService: OnboardService,
    private router: Router,
    private localStorage: LocalStorage,
    private route: ActivatedRoute,

  ) {
    this.route.queryParams.subscribe((res) => {
      console.log(res);
      this.athleteId = res.athleteId;
      this.accessToken = res.accessToken;
    

    })
  }
  async login() {
    let res = await this.onboardService.coachAthleteLogin( this.athleteId,this.accessToken)
    console.log(res)
    if (res.header.status === 'error') {

      console.error(res);
    } else if (res.header.status === 'success') {
      setTimeout(() => {

        localStorage.accessToken = res.header.accessToken;
        console.log(res.body.response);
        const athleteProfile = res.body.response;
        localStorage.athleteProfile = JSON.stringify(athleteProfile);
        this.localStorage.set('userType', 'athlete');
        localStorage.isCoachAccess = true
        const today = new Date();
        this.router.navigate(['/season-planner/training-phase/weekly-summary/daily-workout'], { queryParams: { day: (today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear() }, replaceUrl: true });



      }, 2000);
    }
  }
  ngOnInit() {
    console.log("hey coach welcome")
    this.login()

  }

}