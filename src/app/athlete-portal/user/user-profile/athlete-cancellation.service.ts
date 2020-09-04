import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';



@Injectable()
export class AthleteCancellationService {

    private get accessToken() {
        return localStorage.accessToken;
    }

    private get profileId() {
        return localStorage.athleteProfile ? JSON.parse(localStorage.athleteProfile).athleteId : '';
    }

    constructor(
        private http: HttpClient,
    ) {}

    async getCancellationQuestions() {
        const res = await this.http.get<any>(`${environment.API_ENDPOINT}/athletesvcs/athlete/survey/cancellation/questions`).toPromise();
        return res as any[];
    }

    async submitCancellationSurveyAnswer(questionId: number, survey_response) {
        const res = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/survey/cancellation/response/${this.profileId}/question/${questionId}`, {
            header: { accessToken: this.accessToken },
            survey_response: '' + survey_response 
        }).toPromise();
        return res;
    }
    
 }
