import Debounce from 'debounce-decorator';

import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'angularx-social-login';
import { FacebookLoginProvider } from 'angularx-social-login';
import { isiOSApp } from "../../utils/browser";
import { OnboardService } from '../onboard.service';
import { DEBOUNCE_INTERVAL_DEFAULT_MS, EMAIL_PATTERN } from '../../athlete-portal/constants/constants';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  public signUpForm;
  public errorMessage;
  emailPattern = EMAIL_PATTERN;

  busy = false;
  emailExists = false;
  eligibleForRestart = false;
  trialMessage = '';

  get isiOSApp() {
    return isiOSApp();
  }

  constructor(
    fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private onboardService: OnboardService,
    private route: ActivatedRoute) {
    this.signUpForm = fb.group({
      email: ['', Validators.email],
      password: ['', Validators.required]
    });
  }

  signInWithFB(): void {
    this.authService.authState.subscribe(fbUser => {
      if (fbUser && fbUser.email) {
        this.onboardService.emailChecker(fbUser.email).subscribe(res => {
          this.onboardService.updateUser({
            email: fbUser.email,
            firstName: fbUser.firstName,
            lastName: fbUser.lastName,
            tempUniqueId: fbUser.authToken,
            signInMethod: 'Facebook',
          });
          this.router.navigate(['onboard/step-1']);

        }, (err) => {
          this.errorMessage = err.body.response.msg;
           this.signUpForm.controls.email.setErrors({ 'used': true });
        });
      }
    });

    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  nextStep(isValid: boolean) {
    if (!isValid) {
      return;
    }
    if (this.busy) {
      return;
    }
    if (this.emailExists) {
      this.signUpForm.controls.email.setErrors({ 'used': true });
      return;
    }
    this.onboardService.updateUser({
      email: this.signUpForm.controls.email.value,
      password: this.signUpForm.controls.password.value,
      signInMethod: 'Tridot',
    });
    this.router.navigate(['onboard/step-1']);
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  async checkEmail(email: string) {
    const isValidEmail = this.emailPattern.test(email);
    if (!isValidEmail) {
      return;
    }
    try {
      this.busy = true;
      await this.onboardService.emailChecker(email).toPromise();
      this.emailExists = false;
    } catch (err) {
      this.emailExists = true;
      this.eligibleForRestart = err.body.response.eligibleForRestart;
    } finally {
      this.busy = false;
    }
  }

  ngOnInit() {
    this.onboardService.clear();
    this.route.queryParams.subscribe(res => {
      const subLevel          = parseInt(res.sub, 10);
      const referralId        = parseInt(res.type, 10);
      const referringSourceId = parseInt(res.ref, 10);
      const coachId           = parseInt(res.bbyid, 10);
      this.updateTrialMessage(referralId);
      this.onboardService.updateUser({
        subLevel: subLevel,
        referralId: referralId,
        referringSourceId: referringSourceId,
        coachId: coachId
      });
    });
    if (document.getElementById('mobile-nav')) {
      document.getElementById('mobile-nav').style.cssText = 'display:none !important';
    }
  }

  private updateTrialMessage(referralId: number): void {
    if (referralId) {
      this.onboardService.fetchTrialTypeDetails(referralId).subscribe(res => {
        const trialTypeInfo = res ? res.body.response : {};
        if (trialTypeInfo && trialTypeInfo.active == '1') {
          this.trialMessage = trialTypeInfo.trialMessage;
        }
      }, (err) => {
        console.error('Error while fetching Trial Details', err);
      });
    }
  }
}
