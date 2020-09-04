
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {map, catchError} from 'rxjs/operators';
/**
 * Gloabl Service can be used troughout the module.
 */
import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


import { Country } from '../common-model/country.model';
import { LocalstorageService } from './../common-services/localstorage.service';
import { EU_COUNTRIES } from '../../../assets/data/eu-countries.data';

@Injectable()
export class GlobalService {
  @Output() private layoutChanged: EventEmitter<boolean> = new EventEmitter<boolean>();


  constructor(private http: HttpClient, private localstorageService: LocalstorageService) {}

  private get accessToken() {
    return localStorage.accessToken;
  }

  public httpPost(endPointUri: string, additionalReqBody?: any): Observable<any> {
    const reqBody = additionalReqBody ? Object.assign(additionalReqBody, { athleteId: this.localstorageService.getMemberId()})
                      : { athleteId: this.localstorageService.getMemberId()};
    return this.http.post(environment.API_ENDPOINT + endPointUri,
                            { header: { accessToken: this.accessToken }, body:  reqBody}).pipe(
                    catchError(res => observableThrowError(res)));
  }

  public httpGet(endPointUri: string, fullResponse = false, responseType?): any {
    const additionalParams: any = {};
    if (fullResponse) {
      additionalParams.observe = 'response';
    }
    if (responseType) {
      additionalParams.responseType = responseType;
    }
    return this.http.get(endPointUri, additionalParams).pipe(catchError(res => observableThrowError(res)));
  }

  public readJSON(filePath: string): Observable<Response> {
    return this.http.get(filePath).pipe(
                  map((res: Response) => res),
                  catchError(res => observableThrowError(res)),);
  }

  public getCountries(): Observable<Country[]> {
    return this.readJSON('assets/data/countries-with-states.json').pipe(
        map((res: any) => <Country[]> res));
  }

  public isEUCountry(countryCode: string): boolean {
    const countryIndex = EU_COUNTRIES.findIndex(x => x.code === countryCode)
    return countryIndex !== -1;
  }

  public getGenetics(): Observable<any> {
    return this.readJSON('assets/data/genetics-sample.json');
  }

  public triggerChangeLayout(): void {
    this.layoutChanged.emit(true);
  }

  public getLayoutChangedEvent(): EventEmitter<boolean> {
    return this.layoutChanged;
  }
}
