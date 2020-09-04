
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


import { environment } from "../../../../../environments/environment";

@Injectable()
export class MemberPreferencesService {
  private get profileId() {
    return localStorage.athleteProfile ? JSON.parse(localStorage.athleteProfile).athleteId : '';
  }

  constructor(private http: HttpClient) {}

  getMemberPreferences(): any {
    return this.http.get(environment.API_ENDPOINT + '/athletesvcs/athlete/member-preferences/' + this.profileId).pipe(catchError((res) => observableThrowError(res)));
  }

  saveMemberPreferences(data): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/member-preferences/' + this.profileId, data).pipe(catchError((res) => observableThrowError(res)));
  }
}
