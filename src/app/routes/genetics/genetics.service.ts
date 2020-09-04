
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';


import { HttpClient } from '@angular/common/http';

@Injectable()
export class GeneticsService {

  constructor(
    private http: HttpClient,
  ) {}

  private get athleteId() {
    return localStorage.athleteProfile ? JSON.parse(localStorage.athleteProfile).athleteId : '';
  }

  getClientId(): any {
    return this.http.get(environment.API_ENDPOINT + '/geneticsvcs/athlete/genetics/oauthtoken',
      { params: { 'athleteId': this.athleteId } }).pipe(
      catchError(res => observableThrowError(res)));
  } 
  
  addGeneticDevice(code: string) {
    return this.http.post(`${environment.API_ENDPOINT}/geneticsvcs/athlete/genetics/addGeneticDevice`,
      { athleteId: this.athleteId, code }, { params: { 'athleteId': this.athleteId } }).pipe(
      catchError(res => observableThrowError(res)));
  }

  getGeneticsData(): any {
    return this.http.get(`${environment.API_ENDPOINT}/geneticsvcs/athlete/genetics/getGeneInfoWithResult`,
      { params: { 'athleteId': this.athleteId } }).pipe(
      catchError(res => observableThrowError(res)));
  }

  async getConnectionStatus() {
    try {
      const {genetics} = await this.getGeneticsData().toPromise();
      if (!genetics || !genetics.length) {
        // no genetics data means there's no connection, or gene file has not been uploaded
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  uploadFile(file: any) {
    const request = new FormData();
    request.append('file', file);
    return this.http.post(`${environment.API_ENDPOINT}/geneticsvcs/athlete/genetics/manual/upload`, request, { params: { 'athleteId': this.athleteId} }).pipe(
      catchError(res => observableThrowError(res)));
  }
}
