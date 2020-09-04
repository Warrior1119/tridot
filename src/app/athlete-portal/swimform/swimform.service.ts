
import {map} from 'rxjs/operators';
/**
 * Coach Service used for all business logic of Coaches.
 */
import { Injectable } from '@angular/core';


import { SWIM_FORM_API, SWIM_FORM_SAVE_API } from '../constants/api-end-points';
import { GlobalService } from '../common-services/global.service';
import { Observable } from 'rxjs';


import { ProgressItem } from '../common-components/horizontal-progress-bars/progress-item.model';
import { SwimFormType } from './swim-form-type.model';

@Injectable()
export class SwimFormService {

  constructor(private globalService: GlobalService) {
  }

  public swimForm(): Observable<any> {
    return this.globalService.httpPost(SWIM_FORM_API);
  }

  public saveSwimFormDiagnostics(swimFormDiagnosticsData: any): Observable<Response> {
    return this.globalService.httpPost(SWIM_FORM_SAVE_API, swimFormDiagnosticsData);
  }

  public getSwimFormTypes(): Observable<SwimFormType[]> {
    return this.globalService.readJSON('assets/data/swimformtype.json').pipe(
        map((res: any) => <SwimFormType[]> res));
  }

  public fetchFormMatchProgressItems(swimFormResult: any): ProgressItem[] {
    if (swimFormResult) {
      const progressItems: ProgressItem[] = [];
      progressItems.push(new ProgressItem('Lightweight',  swimFormResult.lightWeightAssessment));
      progressItems.push(new ProgressItem('Tarzan',       swimFormResult.tarzanAssessment));
      progressItems.push(new ProgressItem('Overglider',   swimFormResult.overgliderAssessment));
      progressItems.push(new ProgressItem('Overkicker',   swimFormResult.overkickerAssessment));
      progressItems.push(new ProgressItem('Swinger',      swimFormResult.swingerAssessment));
      progressItems.push(new ProgressItem('Classic',      swimFormResult.classicAssessment));
      return progressItems;
    }
  }
}
