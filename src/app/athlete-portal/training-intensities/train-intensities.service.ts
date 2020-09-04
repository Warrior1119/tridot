
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';


import { LocalstorageService } from './../common-services/localstorage.service';

@Injectable()
export class TrainIntensitiesService {
  
  constructor(private http: HttpClient, private localstorageService: LocalstorageService,) {}

  private get accessToken() {
    return this.localstorageService.getAccessToken();
  }

  getTrainingIntensities(temp, humidity, elevation, swimUnits, runUnits): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/ti/get',
      {
        header: { accessToken: this.accessToken },
        body: {
          athleteId: this.localstorageService.getMemberId(),
          swimUnits: swimUnits,
          runUnits: runUnits,
          temperature: temp,
          humidity: humidity,
          elevation: elevation
        }
      }).pipe(
      catchError(res => observableThrowError(res)));
  }

  getWeather(lookupType, position): any {
    var header = {};
    header['accessToken'] = this.accessToken;
    if (position && position.coords) {
      header['latitude'] = position.coords.latitude;
      header['longitude'] = position.coords.longitude;
    }

    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/weather/lookup',
      {
        header: header,
        body: {
          athleteId: this.localstorageService.getMemberId(),
          lookupType: lookupType
        }
      }).pipe(catchError(res => observableThrowError(res)));
  }
}
