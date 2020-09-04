import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable ,  Subject } from 'rxjs';
import { ATHLETE_SESSIONS_API } from '../constants/api-end-points';
import { GlobalService } from '../common-services/global.service';
import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http';
import { LocalstorageService } from './../common-services/localstorage.service';

@Injectable()
export class SessionService {

  private sessions = new Subject<any>();

  constructor(private httpClient: HttpClient,
    private localstorageService: LocalstorageService,
    private globalService: GlobalService) { }

  getSessions(): Observable<any> {
    return this.sessions.asObservable();
  }

  public exportSession(sessionId: number, payload: any): Observable<HttpResponse<any>> {
    return this.httpClient.post(
      `${environment.API_ENDPOINT}/athletesvcs/athlete/sessions/${sessionId}/workout/export`,
      payload,
      {
        observe: 'response',
        responseType: 'blob' as 'json',
        headers: new HttpHeaders()
          .set('Authorization', `Bearer ${this.localstorageService.getAuthHeaders()}`)
      }).catch(res => Observable.throw(res));
  }

  public exportWorkout(sessionId: number, exportType: string): Observable<any> {
    const responseType = exportType === 'fit' ? 'blob' : 'text';
    return this.globalService.httpGet(environment.API_ENDPOINT + ATHLETE_SESSIONS_API + sessionId + '/workout/' + exportType, true, responseType);
  }

  public isWorkoutDataAvailable(sessionId: number): Observable<any> {
    return this.globalService.httpGet(environment.API_ENDPOINT + ATHLETE_SESSIONS_API + sessionId + '/workouts', true);
  }

  public confirmAutoCreatedSessionReview(sessionId: number): Observable<any> {
    return this.globalService.httpPost(`${ATHLETE_SESSIONS_API}/${sessionId}/confirm-auto-creation`);
  }

  public pushSessionWorkoutToGarmin(sessionId: number): Observable<any> {
    return this.globalService.httpPost( `${ATHLETE_SESSIONS_API}/${sessionId}/pushworkouttogarmin`);
  }
}
