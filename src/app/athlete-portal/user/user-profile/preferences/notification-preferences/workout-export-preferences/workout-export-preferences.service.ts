
import {throwError as observableThrowError,  Observable } from 'rxjs';
import {catchError} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../../../../../../environments/environment";

@Injectable()
export class WorkoutExportPreferencesService {
  private get memberId() {
    return localStorage.athleteProfile ? JSON.parse(localStorage.athleteProfile).athleteId : '';
  }

  constructor(private http: HttpClient) {}

  getWorkoutExportPreferences(): any {
    return this.http.get(environment.API_ENDPOINT + '/athletesvcs/athlete/workout-preferences/' + this.memberId).pipe(catchError((res) => observableThrowError(res)));
  }

  getWorkoutExportPreferencesForSession(sessionId: number): any {
    return this.http.get(environment.API_ENDPOINT + '/athletesvcs/athlete/workout-preferences/' + this.memberId + '/session/' + sessionId).pipe(catchError((res) => observableThrowError(res)));
  }

  saveWorkoutExportPreferences(data: any): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/workout-preferences/' + this.memberId, data).pipe(catchError((res) => observableThrowError(res)));
  }
}
