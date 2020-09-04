
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "../../../environments/environment";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import { LocalstorageService } from './../common-services/localstorage.service';

@Injectable()
export class DashboardServiceService {

  constructor(private http: HttpClient, private localstorageService: LocalstorageService) { }

  private get accessToken() {
    return this.localstorageService.getAccessToken();
  }

  getSearchResults(search): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/km/getsearchresult',
      { header: { accessToken: this.accessToken }, 
        body: { memberId: this.localstorageService.getMemberId(), 
                search_text: search, userType: 'athlete' } }).pipe(
      catchError(res => observableThrowError(res)));
  }

  getCoach(coachId): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/coach/profile',
    { header: { accessToken: this.accessToken }, body: { coachId: coachId } }).pipe(
    catchError(res => observableThrowError(res)));
  }

  enableAssessment(): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/user/assessmentBlockChecked',
    { header: { accessToken: this.accessToken }, body: { blockChecked: 1 } }).pipe(
    catchError(res => observableThrowError(res)));
  }

  advancedDashboard(): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/user/advancedDashboardAgreed',
    { header: { accessToken: this.accessToken }, body: { advancedDashboardAgreed: 1 } }).pipe(
    catchError(res => observableThrowError(res)));
  }

  getCoaches(query): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/coach/onboardsearch',
      { header: { accessToken: this.accessToken }, body: { athleteId: this.localstorageService.getMemberId(), searchString: query } }).pipe(
      catchError(res => observableThrowError(res)));
  }

  getCoachTestimonials(coachId): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/coach/testimonials',
    { header: { accessToken: this.accessToken }, body: { coachId: coachId } }).pipe(
    catchError(res => observableThrowError(res)));
  }

  addCoach(coachId): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/user/assigncoach',
    { header: { accessToken: this.accessToken }, body: { athleteId: this.localstorageService.getMemberId(), coachId: coachId } }).pipe(
    catchError(res => observableThrowError(res)));
  }

  addTestimonial(testimonial): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/coach/updatetestimonial',
    { header: { accessToken: this.accessToken }, body: testimonial }).pipe(
    catchError(res => observableThrowError(res)));
  }

  showArticle(articleId): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/km/showarticle',
      {
        header: { accessToken: this.accessToken },
        body: {
          memberId: this.localstorageService.getMemberId(),
          article_type: 'article',
          articleId: articleId,
          userType: 'athlete'
        }
      }).pipe(
      catchError(res => observableThrowError(res)));
  }

  submitcomment(articleId, comment): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/km/submitcomment',
      {
        header: { accessToken: this.accessToken },
        body: {
          authorId: this.localstorageService.getMemberId(),
          article_type: 'article',
          id: articleId,
          userType: 'athlete',
          publicComment: true,
          createdAt: new Date().toDateString(),
          body: comment
        }
      }).pipe(
      catchError(res => observableThrowError(res)));
  }

}
