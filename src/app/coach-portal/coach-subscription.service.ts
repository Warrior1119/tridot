import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';



@Injectable()
export class CoachSubscriptionService {

    constructor(
        private http: HttpClient,
    ) {}

    async getCoachSubscriptionLevels() {
        try {
            const res: any = await this.http.get(`${environment.API_ENDPOINT}/athletesvcs/coach/subscription-levels`).toPromise();
            return res.body.response;    
        } catch (err) {
            console.error('Unable to fetch coach subscription levels', err);   
            return null;
        }
    }

    async getSubscriptionLevelDetails(subscriptionLevelId: any) {
        try {
            const res: any = await this.http.get(`${environment.API_ENDPOINT}/athletesvcs/coach/subscription-levels/` + subscriptionLevelId).toPromise();
            return res.body.response;   
        } catch (err) {
            console.error('Unable to fetch subscrption charge info', err);   
            return null;            
        }
    }
    
    async getCoachCurrentSubscription() {
        try {
            const res: any = await this.http.get(`${environment.API_ENDPOINT}/athletesvcs/coach/subscriptions/current`).toPromise();
            return res.body.response;   
        } catch (err) {
            console.error('Unable to fetch current subscrption', err);   
            return null;            
        }
    }

    async getCoachPaymentDetails() {
        try {
            const res: any = await this.http.get(`${environment.API_ENDPOINT}/athletesvcs/coach/payment-details`).toPromise();
            return res.body.response;   
        } catch (err) {
            console.error('Unable to fetch current subscrption', err);   
            return null;            
        }
    }

    async changeSubscription(subscriptionLevelId: number, reqData: any) {
        try {
            return await this.http.post(environment.API_ENDPOINT + '/athletesvcs/coach/subscriptions/' + subscriptionLevelId, reqData).toPromise();
        } catch (err) {
            console.error('Unable to change subscrption', err);   
            throw err;
        }
    }
 }
