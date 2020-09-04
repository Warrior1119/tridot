
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';


import { GlobalService } from '../../common-services/global.service';

@Injectable()
export class StripeGatewayService {

    constructor(private http: HttpClient, private globalService: GlobalService) {}

    public async createClientIntent(subScriptionLevelId): Promise<any> {
        return this.http.get(environment.API_ENDPOINT + '/athletesvcs/athlete/stripe/create-setup-intent/' + subScriptionLevelId).pipe(
                                                    catchError(res => observableThrowError(res))).toPromise();
    }
    
    public async getPublishableKey(subScriptionLevelId): Promise<any> {
        return this.globalService.httpGet(environment.API_ENDPOINT + '/athletesvcs/athlete/stripe/publishable-key/' + subScriptionLevelId, false, 'text').pipe(
                                                    catchError(res => observableThrowError(res))).toPromise();
    }

    public async createClientIntentForCoach(subScriptionLevelId): Promise<any> {
        return this.http.get(environment.API_ENDPOINT + '/athletesvcs/coach/stripe/create-setup-intent/' + subScriptionLevelId).pipe(
                                                    catchError(res => observableThrowError(res))).toPromise();
    }
    
    public async getPublishableKeyForCoach(subScriptionLevelId): Promise<any> {
        return this.globalService.httpGet(environment.API_ENDPOINT + '/athletesvcs/coach/stripe/publishable-key/' + subScriptionLevelId, false, 'text').pipe(
                                                    catchError(res => observableThrowError(res))).toPromise();
    }
}
