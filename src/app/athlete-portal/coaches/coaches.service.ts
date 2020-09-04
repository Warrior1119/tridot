/**
 * Coach Service used for all business logic of Coaches.
 */
import { Injectable } from '@angular/core';


import { COACH_PHOTOS_API } from '../constants/api-end-points';
import { GlobalService } from '../common-services/global.service';
import { LocalstorageService } from '../common-services/localstorage.service';
import { Observable } from 'rxjs';



@Injectable()
export class CoachesService {

  constructor(private globalService: GlobalService,
              private localstorageService: LocalstorageService) {
  }

  public getCoachPics(coachId: number): Observable<any> {
    return this.globalService.httpPost(COACH_PHOTOS_API, { coachId: coachId });
  }
}
