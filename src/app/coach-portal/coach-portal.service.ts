
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {tap, catchError,  map } from 'rxjs/operators';
/**
 * Coach Service used for all business logic of Coaches.
 */
import { Injectable } from '@angular/core';


import { COACH_ATHLETES } from '../athlete-portal/constants/api-end-points';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LocalstorageService } from '../athlete-portal/common-services/localstorage.service';

@Injectable()
export class CoachPortalService {

  constructor(private http: HttpClient,
             private localstorageService: LocalstorageService) {
  }

  private get accessToken() {
    return this.localstorageService.getCoachAccessToken();
  }

 public getCoachAthletes(coachId: number, assignmentStatus: String): Observable<any> {
    const request = {
      header: { accessToken: this.accessToken },
      body: {
        coachId,
        assignmentStatus,
      },
    };

    return this.http.post(environment.API_ENDPOINT + COACH_ATHLETES, request)
      .pipe(map((response: any) => response.body.response)).pipe(
      catchError((res) => observableThrowError(res)));
  }

  public getCoachProfile() {
    const request = {
      header: { accessToken: this.accessToken },
      body: { accessToken: this.accessToken },
    };

    return this.http.post(environment.API_ENDPOINT + "/athletesvcs/athlete/user/profilebyemail", request).pipe(
      tap((response: any) => {
        localStorage.setItem("coachProfile", JSON.stringify(response.body.response.coachProfile));
      }))
      .pipe(map((response) => response.body.response)).pipe(
      catchError((res) => observableThrowError(res)));
  }

  public saveCoachProfile(profile: any) {
    const request = {
      header: { accessToken: this.accessToken },
      body: profile,
    };

    return this.http.post(environment.API_ENDPOINT + "/athletesvcs/athlete/coach/saveprofile", request).pipe(
      tap((response: any) => {
        localStorage.setItem("coachProfile", JSON.stringify(response.body.response));
      }))
      .pipe(map((response) => response.body.response)).pipe(
      catchError((res) => observableThrowError(res)));
  }

  public toggleActivityEmail(coachId: number, athleteId: number, activityEmailsEnabled: boolean) {
    const request = {
      header: { accessToken: this.accessToken },
      body: {
        coachId: coachId,
        athleteId: athleteId,
        enable: activityEmailsEnabled
      }
    };

    return this.http.post(environment.API_ENDPOINT + "/athletesvcs/athlete/coach/setactivityemail", request).pipe(
      catchError((res) => observableThrowError(res)));
  }

  public uploadAvatar(coachId: any, file: any) {
    const meta = {
      header: { accessToken: this.accessToken },
      body: {
        photoType: "profile",
        userId: coachId,
        userType: "coach",
      },
    };

    const request = new FormData();
    request.append("uploadMetaData", JSON.stringify(meta));
    request.append("file", file);

    return this.http.post(environment.API_ENDPOINT + "/dipsvc/file/photo/receive", request).pipe(
      catchError((res) => observableThrowError(res)));
  }
}
