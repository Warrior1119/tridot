
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';


import { LocalstorageService } from './../common-services/localstorage.service';

@Injectable()
export class RaceXService {
  
  constructor(private http: HttpClient,
              private localstorageService: LocalstorageService) {}

  private get accessToken() {
    return this.localstorageService.getAccessToken();
  }

  getRaces(): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/dash/myraces',
      { header: { accessToken: this.accessToken }, 
        body: { memberId: this.localstorageService.getMemberId() } }).pipe(
      catchError(res => observableThrowError(res)))
  }

  async raceDetails(raceId: string): Promise<any> {
    const res: any = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/racex/lookupdetails`,
      { header: { accessToken: this.accessToken }, body: { raceId } }).toPromise();
    return res.body.response;
  }

  async getNutrition(raceId: string): Promise<any> {
    const res: any = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/racex/getnutrition`,
      { header: { accessToken: this.accessToken }, body: { raceId } }).toPromise();
    return res.body.response;
  }

  importNutritionData(from, to): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/racex/importnutrition',
      { header: { accessToken: this.accessToken }, body: { fromRaceId: from, toRaceId: to } }).pipe(
      catchError(res => observableThrowError(res)))
  }

  async update(body): Promise<any> {
    const res = await this.http.patch(`${environment.API_ENDPOINT}/athletesvcs/athlete/racex/update`,
      { header: { accessToken: this.accessToken }, body }).toPromise();
    return res;
  }

  save(edit): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/racex/save',
      { header: { accessToken: this.accessToken }, body: edit }).pipe(
      catchError(res => observableThrowError(res)))
  }

}
