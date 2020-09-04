
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError,  map } from 'rxjs/operators';
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { LocalstorageService } from "../../../athlete-portal/common-services/localstorage.service";

@Injectable()
export class CoachPhotosService {

  constructor(
    private http: HttpClient,
    private localstorageService: LocalstorageService,
  ) {}

  private get accessToken() {
    return this.localstorageService.getCoachAccessToken();
  }

  public getPhotos(coachId: any) {
    const request = {
      header: { accessToken: this.accessToken },
      body: {
        coachId,
      },
    };

    return this.http.post(environment.API_ENDPOINT + "/athletesvcs/athlete/coach/photos", request)
      .pipe(map((response: any) => response.body.response)).pipe(
      catchError((res) => observableThrowError(res)));
  }

  public postPhoto(coachId: any, photoId: any, file: any) {
    const meta = {
      header: { accessToken: this.accessToken },
      body: {
        photoId,
        photoType: "other",
        userId: coachId,
        userType: "coach",
      },
    };

    const request = new FormData();
    request.append("uploadMetaData", JSON.stringify(meta));
    request.append("file", file);

    return this.http.post(environment.API_ENDPOINT + "/dipsvc/file/photo/receive", request).pipe(
      catchError((res) => observableThrowError(res)));
  }

  public deletePhoto(coachId: any, photoId: any) {
    const request = {
      header: { accessToken: this.accessToken },
      body: {
        coachId,
        photoId,
        userType: "coach",
      },
    };

    return this.http.post(environment.API_ENDPOINT + "/athletesvcs/athlete/coach/deletephoto", request).pipe(
      catchError((res) => observableThrowError(res)));
  }
}
