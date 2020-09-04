
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {map, catchError} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';



import { LocalStorage } from '../athlete-portal/common-services/local-storage';

const ONBOARDING_DEFAULT_ARGS = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  height: '',
  weight: '',
  birthDate: '',
  gender: '',
  performanceLevel: 0,
  primaryRaceDistance: 0,
  referralId: 0,
  tempUniqueId: '',
  signInMethod: '',
  preferredMeasurementSystem: '',
  paymentDetails:{},
};

@Injectable()
export class OnboardService {

  constructor(
    private http: HttpClient,
    private localStorage: LocalStorage,
  ) {}

  get user() {
    return this.localStorage.get('onboardingUser', {} as any);
  }

  emailChecker(email: string): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/user/onboardEmailCheck', { body: { email } }).pipe(
      catchError(res => observableThrowError(res)));
  }

  userHasFields(...fields: string[]) {
    if (!this.user) {
      return false;
    }
    return fields.every(field => typeof this.user[field] !== 'undefined');
  }

  updateUser(changes?) {
    const user = this.user;
    if (changes) {
       Object.assign(user, changes);
    }
    this.localStorage.set('onboardingUser', user);
  }

  clear() {
    this.localStorage.clear('onboardingUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('coachAccessToken');
    localStorage.removeItem('isCoachAccess');
    this.localStorage.clear('userType');
    localStorage.removeItem('athleteProfile');
    this.localStorage.clear('coachProfile');
    localStorage.removeItem('mainMenu');
    localStorage.removeItem('subMenu');
    this.clearOnBoardSessionStorage();
  }

  public clearOnBoardSessionStorage() {
    localStorage.removeItem('swimOnBoardProfile');
    localStorage.removeItem('bikeOnBoardProfile');
    localStorage.removeItem('runOnBoardProfile');
  }

  confirmEmail(token): any{
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/user/confirmemail', { body: { confirmToken: token } }).pipe(
      catchError(res => observableThrowError(res)));
  }

  signUp(): any {
    console.log("user "+JSON.stringify(this.user))
    const body = Object.assign(ONBOARDING_DEFAULT_ARGS, this.user);
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/onboard/user/onboardStart', { body }).pipe(
      catchError(res => observableThrowError(res)));
  }

  async signIn(user, position): Promise<any> {

    return await this.http.post<any>(environment.API_ENDPOINT + '/athletesvcs/athlete/user/login',
      {
        body: user,
        header: {
          latitude: position && position.latitude || '',
          longitude: position && position.longitude || '',
        },
      })
      .toPromise();
  }

  async coachAthleteLogin(athleteId, accessToken): Promise<any> {
    localStorage.setItem('accessToken', accessToken);
    return await this.http.post<any>(environment.API_ENDPOINT + '/athletesvcs/athlete/coach/proxylogin',
      {
        body: {athleteId: athleteId},
        header: {
          accessToken: accessToken
        },
      })
      .toPromise();
  }

  signInAfterFB(user): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/user/login',
      { body: { userName: user }, header: { accessToken: 'owieuriwhfkljkfdsf' } }).pipe(
      catchError(res => observableThrowError(res)));
  }


  resetPassword(email): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/user/resetpassword', { body: { email: email } }).pipe(
      catchError(res => observableThrowError(res)));
  }

  resendverifyemail(email): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/user/resendverifyemail', { body: { email: email } }).pipe(
      catchError(res => observableThrowError(res)));
  }

  async changeEmail(newEmail: string, accessToken = localStorage.accessToken): Promise<any> {
    const response = await this.http.post<any>(
      `${environment.API_ENDPOINT}/athletesvcs/onboard/user/changeEmailId`,
      { header: { accessToken }, body: { newEmail } }).toPromise();
    if (response.header.status === 'error') {
      throw response;
    }
    return response;
  }

  saveSwim(swim): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/onboard/user/saveswim', { body: swim }).pipe(
      catchError(res => observableThrowError(res)));
  }

  saveBike(bike): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/onboard/user/savebike', { body: bike }).pipe(
      catchError(res => observableThrowError(res)));
  }

  saveRun(run): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/onboard/user/saverun', { body: run }).pipe(
      catchError(res => observableThrowError(res)));
  }

  saveSwim2(swim2): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/onboard/user/onboardComplete', { body: swim2 }).pipe(
      catchError(res => observableThrowError(res)));
  }

  fetchTrialTypeDetails(referralId): any {
    return this.http.get(environment.API_ENDPOINT + '/athletesvcs/onboard/trail-types/'+referralId).pipe(
      map((res: Response) => res.json()),catchError(res => observableThrowError(res.json())),);
  }
}
