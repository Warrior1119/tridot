import { Component, HostListener, OnInit } from '@angular/core';
import { OnboardService } from '../onboard.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-step-3',
  templateUrl: './step-3.component.html',
  styleUrls: ['./step-3.component.scss']
})
export class Step3Component implements OnInit {

  @HostListener('window:beforeunload', ['$event']) onBeforeUnload($event) {
    return $event.returnValue = false;
  }

  constructor(private onboardService: OnboardService, private router: Router) { }

  ngOnInit() {
    if (!this.onboardService.userHasFields('email', 'password', 'firstName', 'lastName', 'height', 'weight')) {
      this.router.navigate(['/onboard/sign-up']);
      return;
    }
  }

  nextStep(performanceLevel) {
    this.onboardService.updateUser({
      performanceLevel,
    });
    this.router.navigate(['onboard/step-4']);
  }

}
