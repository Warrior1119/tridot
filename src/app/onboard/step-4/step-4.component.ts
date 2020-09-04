import { Component, HostListener, OnInit } from '@angular/core';
import { OnboardService } from '../onboard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-step-4',
  templateUrl: './step-4.component.html',
  styleUrls: ['./step-4.component.scss']
})
export class Step4Component implements OnInit {

  @HostListener('window:beforeunload', ['$event']) onBeforeUnload($event) {
    return $event.returnValue = false;
  }

  public error: string;
  public loading =  false;
  public primaryRaceDistance: number;

  constructor(private onboardService: OnboardService, private router: Router) { }

  ngOnInit() {
    if (
        !this.onboardService.userHasFields(
          'email', 'password', 'firstName', 'lastName', 'height', 'weight', 'performanceLevel')
      ) {
       this.router.navigate(['/onboard/sign-up']);
       return;
     }
  }

  public nextStep(primaryRaceDistance): void {
    this.primaryRaceDistance = primaryRaceDistance;
    this.onboardService.updateUser({
      primaryRaceDistance,
    });
    this.signUp();
  }

  public signUp(): void {
    this.loading = true;
    this.onboardService.signUp().subscribe((res) => {
      if (res.header.status === 'success') {
        localStorage.accessToken = res.header.accessKey;
        localStorage.athleteProfile = JSON.stringify(res.body.response);
        localStorage.onboardingComplete = true;
        this.loading = false;
        this.router.navigate(['onboard/step-5']);
      } else {
        this.loading = false;
        this.error = 'Unable to process request, please contact support.';
      }
    }, (res) => {
      this.loading = false;
      this.error = res.body.response.msg;
    });
  }
}
