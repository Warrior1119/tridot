
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError,  map } from 'rxjs/operators';
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { LocalstorageService } from "../../../athlete-portal/common-services/localstorage.service";

@Injectable()
export class CoachTestimonialsService {
  private get accessToken() {
    return this.localstorageService.getCoachAccessToken();
  }

  constructor(
    private http: HttpClient,
    private localstorageService: LocalstorageService,
  ) {}

  public getTestimonials(coachId: any) {
    const request = {
      header: { accessToken: this.accessToken },
      body: { coachId },
    };

    return this.http.post(environment.API_ENDPOINT + "/athletesvcs/athlete/coach/testimonials", request)
      .pipe(map((response: any) => {
        return response.body.response.map(((item) => {
          return { ...item,
            athletePhotoLarge: environment.API_ENDPOINT + item.athletePhotoLarge,
            athletePhotoMedium: environment.API_ENDPOINT + item.athletePhotoMedium,
            athletePhotoSmall: environment.API_ENDPOINT + item.athletePhotoSmall,
          };
        }));
      })).pipe(
      catchError((res) => observableThrowError(res)));
  }

  public updateTestimonial(testimonial: any) {
    const request = {
      header: { accessToken: this.accessToken },
      body: testimonial,
    };

    return this.http.post(environment.API_ENDPOINT + "/athletesvcs/athlete/coach/updatetestimonial", request)
      .pipe(map((response: any) => response.body.response)).pipe(
      catchError((res) => observableThrowError(res)));
  }

}
