
import {throwError as observableThrowError } from 'rxjs';

import {catchError} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


import { LocalstorageService } from './../common-services/localstorage.service';

@Injectable()
export class AssessmentsService {
  constructor(private http: HttpClient, private localstorageService: LocalstorageService) {}

  private get accessToken() {
    return localStorage.accessToken;
  }

  async getPastAssessments(sessionType: string): Promise<any> {
    const res: any = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/assess/past`,
      {
        header: { accessToken: this.accessToken },
        body: {
          athleteId: this.localstorageService.getAccessToken(),
          sessionType: sessionType
        }
      }).toPromise();
     return res.body.response;
  }

  getBasicAssessmentDetails(memberId: number): any {
    return this.http.get(environment.API_ENDPOINT + '/athletesvcs/athlete/assess/basic/'+memberId).pipe(
          catchError(res => observableThrowError(res)));
  }

  deleteAssessment(sessionType, assessment): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/assess/delete',
      {
        header: { accessToken: this.accessToken },
        body: {
          athleteId: this.localstorageService.getAccessToken(),
          sessionType: sessionType,
          assessmentId: assessment.id
        }
      }).pipe(catchError(res => observableThrowError(res)));;
  }

  async save(type: string, body): Promise<any> {
    const res: any = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/assess/save${type}`,
    {
      header: { accessToken: this.accessToken },
      body
    }).toPromise();
    return res.body.response;
  }
}
