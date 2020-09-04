import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { AuthService } from 'angularx-social-login';
import { FacebookLoginProvider } from 'angularx-social-login';
import { Router, ActivatedRoute } from '@angular/router';
import { OnboardService } from '../../onboard/onboard.service';
import { LocalStorage } from '../common-services/local-storage';
import { GeolocationService } from '../common-services/geolocation.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  loginForm;
  fbUser;
  errorCode: string;
  errorMessage: string;

  loading = false;
  resendSuccess = false;

  user = {
    userName: '',
    password: ''
  };
  emailError = 'Please verify your email address';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private onboardService: OnboardService,
    private localStorage: LocalStorage,
    private geolocationService: GeolocationService,
    private route: ActivatedRoute,
  ) {
    this.loginForm = fb.group({
      email: ['', Validators.email],
      password: ['', Validators.required]
    });
    this.route.queryParams.subscribe(({isSessionExpired}) =>  {
      if (isSessionExpired) {
        this.errorMessage = 'Session Expired. Please Login Again.';
      }
    });
  }

  _coords;

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);

    this.authService.authState.subscribe(fbUser => {
      this.fbUser = fbUser;

      if (fbUser && fbUser.email) {
        const user = {
          userName: fbUser.email,
          password: fbUser.authToken
        };
        this.signIn(user);
      }
    });

  }

  async signInAfterFB(user) {
    this.loading = true;
    try {
      const res = await this.onboardService.signIn(user, this._coords);

      if (res.header.status === 'error') {
        const {code, msg} = res.body.response;
        this.errorCode = code;
        this.errorMessage = msg;
        this.loading = false;
        console.error(res);
      } else if (res.header.status === 'success') {
        const {authToken, athleteProfile, coachProfile, userType} = res.body.response;
        localStorage.accessToken = authToken;
        localStorage.athleteProfile = JSON.stringify(athleteProfile);
        this.localStorage.set('userType', userType);
        this.localStorage.set('coachProfile', coachProfile);
        setTimeout(() => {
          if (window.location.host === res.body.response.athleteProfile.currentVersionUrl) {
            this.loading = false;
            window.location.href = window.location.origin;
          } else {
            const switchURL = window.location.protocol + '//' + res.body.response.athleteProfile.currentVersionUrl + '/';
            const url = switchURL + '?' + 'access_token=' + localStorage.accessToken;
            this.onboardService.clear();
            window.open(url, '_self');
          }
        }, 2000);
      }

    } catch (err) {
      this.loading = false;
      console.error(err);
    }
  }

  async signIn(user) {
    this.loading = true;
    try {
      const res = await this.onboardService.signIn(user, this._coords);

      if (res.header.status === 'error') {
        const {code, msg} = res.body.response;
        this.errorCode = code;
        this.errorMessage = msg;
        this.loading = false;
        console.error(res);
      } else if (res.header.status === 'success') {
        setTimeout(() => {
          this.loading = false;
          console.log(res.body.response);
          const {athleteProfile, coachProfile, userType} = res.body.response;
          localStorage.athleteProfile = JSON.stringify(athleteProfile);
          localStorage.userType = userType;
          localStorage.coachProfile = JSON.stringify(coachProfile);
          this.localStorage.set('userType', userType);
          this.localStorage.set('coachProfile', JSON.stringify(coachProfile));
          console.log('url verification success');
          if (res.body.response.userType === 'athlete' ) {
            localStorage.accessToken = res.header.accessToken;
            const profile = res.body.response.athleteProfile;
            if (profile.eligibleForRestart) {
              this.router.navigate(['/onboard/restart-trial']);
            } else if (profile.onboardingStatus === 'incomplete') {
              window.location.href = window.location.origin + '/' + profile.onboardingStep;
            } else if (window.location.host === profile.currentVersionUrl || window.location.origin.includes('localhost')) {
               if (!profile.subscriptionId || +profile.subscriptionDaysRemain < 0) {
                // Subscription expired
                this.router.navigate(['/user/subscription-options']);
              } else {
                this.router.navigate(['/']);
              }
            } else {
              const switchURL = window.location.protocol + '//' + profile.currentVersionUrl + '/';
              const url = switchURL + '?' + 'access_token=' + localStorage.accessToken;
              this.onboardService.clear();
              window.open(url, '_self');
            }
          } else if (res.body.response.userType === 'coach') {
                localStorage.coachAccessToken = res.header.accessToken;
                this.router.navigate(['/coach']);
          }
        }, 2000);
      }
    } catch (err) {
      this.loading = false;
      console.error(err);
    }
  }

  async ngOnInit() {
    this.onboardService.clear();
    const {coords} = await this.geolocationService.getCurrentPosition();
    this._coords = coords;
  }

  async resend(email: string) {
    this.loading = true;
    try {
      const res = await this.onboardService.resendverifyemail(email).toPromise();
      if (res.header.status === 'error') {
        const {code, msg} = res.body.response;
        this.errorCode = code;
        this.errorMessage = msg;
        this.loading = false;
      } else if (res.header.status === 'success') {
        this.loading = false;
        this.resendSuccess = true;
      }

    } catch (err) {
      this.loading = false;
      this.errorCode = null;
      this.errorMessage = "Something went wrong. Please try again later."
    }
  }

}
