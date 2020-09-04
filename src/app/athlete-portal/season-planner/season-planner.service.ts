
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError} from 'rxjs/operators';
import * as moment from 'moment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';


import { array2map, chunks, splitBy } from "../../utils/array";
import { SCHEDULE_ROW_LENGTH, SCHEDULE_ROW_LENGTH_MOBILE } from "../constants/constants";
import { LocalstorageService } from './../common-services/localstorage.service';

@Injectable()
export class SeasonPlannerService {
  
  constructor(private http: HttpClient, private localstorageService: LocalstorageService) {}

  private get accessToken() {
    return this.localstorageService.getAccessToken();
  }

  async getPlans(startFromPhaseId?: number): Promise<any> {
    try {
      const res: any = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/season/plans`,
        { header: { accessToken: this.accessToken }, 
          body: { memberId: this.localstorageService.getMemberId() } }).toPromise();
      return res.body.response.map(plan => this._parsePlan(plan, startFromPhaseId));
    } catch (err) {
      throw err;
    }
  }

  getPhaseSchedule(phaseId, raceId): any {
    return this.http
      .post(
        environment.API_ENDPOINT + '/athletesvcs/athlete/season/phaseschedule',
        {
          header: { accessToken: this.accessToken },
          body: { athelteId: this.localstorageService.getMemberId(),
          phaseId: phaseId, raceId: raceId }
        }).pipe(catchError(res => observableThrowError(res)));
  }

  getPhasePreferences(phaseId, raceId): any {
    return this.http
      .post(
        environment.API_ENDPOINT + '/athletesvcs/athlete/season/phasepreferences',
        {
          header: { accessToken: this.accessToken },
          body: { athelteId: this.localstorageService.getMemberId(),
          phaseId: phaseId, raceId: raceId }
        }).pipe(catchError(res => observableThrowError(res)));
  }

  savePhasePreferences(preferences): any {
    return this.http
      .post(
        environment.API_ENDPOINT + '/athletesvcs/athlete/season/savephasepreferences',
        {
          header: { accessToken: this.accessToken },
          body: preferences
        }
      ).pipe(catchError(res => observableThrowError(res)));
  }

  async getPlanById(seasonPlanId): Promise<any> {
    try {
      const res: any = await this.http
        .post(
          `${environment.API_ENDPOINT}/athletesvcs/athlete/season/plan`,
          {
            header: { accessToken: this.accessToken },
            body: { seasonPlanId: seasonPlanId }
          }).toPromise();
      return this._parsePlan(res.body.response, null);
    } catch (err) {
      throw err;
    }
  }

  getRaces(): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/season/listedraces',
      { header: { accessToken: this.accessToken }, body: { memberId: this.localstorageService.getMemberId() } }).pipe(
      catchError(res => observableThrowError(res)));
  }

  addSeason(season): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/season/addseason',
      { header: { accessToken: this.accessToken }, body: season }).pipe(
      catchError(res => observableThrowError(res)));
  }

  addRace(race): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/season/addrace',
      { header: { accessToken: this.accessToken }, body: race }).pipe(
      catchError(res => observableThrowError(res)));
  }

  validateRace(race): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/season/validateAddRace',
      { header: { accessToken: this.accessToken }, body: race }).pipe(
      catchError(res => observableThrowError(res)));
  }

  renameSeason(season): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/season/rename',
      { header: { accessToken: this.accessToken }, body: season }).pipe(
      catchError(res => observableThrowError(res)));
  }

  async makeLiveSeason(seasonPlanId: string, athleteId: number): Promise<any> {
    try {
      const res = 
        await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/season/makeprimary`,
          { 
            header: { accessToken: this.accessToken }, 
            body: { seasonPlanId, athleteId },
          }).toPromise();

      return res;
    } catch (err) {
      throw err;
    }
  }

  deleteSeason(season): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/season/delete',
      { header: { accessToken: this.accessToken }, body: season }).pipe(
      catchError(res => observableThrowError(res)));
  }

  getRaceCategory(): any {
    return this.http.get(environment.API_ENDPOINT + '/data/plan/racecategory.json').pipe(
      catchError(res => observableThrowError(res)));
  }

  async deleteRace(raceToDelete): Promise<any> {
    try {
      const res = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/season/deleterace`, {
        header: { accessToken: this.accessToken },
        body: raceToDelete,
      }).toPromise();
      return res;
    } catch (err) {
      throw err;
    }
  }

  private _parsePlan(plan, startAfterPhaseId: number) {

    const getWeekStartForRace = 
      (race) => 
        moment(race.raceDate, 'MM/DD/YYYY')
        .isoWeekday(1)
        .format('MM/DD/YYYY');

    // extract all races to match with week's race data
    const racesByPhaseWeek = 
      array2map(plan.phases, 
        phase => phase.phaseId, 
        phase => array2map(phase.races, getWeekStartForRace));

    if (!plan.seasonSchedule) {
      return plan;
    }

    // take weeks only after given phaseId is met
    let phaseIdMatch = false;
    const seasonSchedule = plan.seasonSchedule.filter(week => { 
      if (!startAfterPhaseId) {
        return true;
      }
      phaseIdMatch = phaseIdMatch || week.phaseId == startAfterPhaseId;
      return phaseIdMatch && week.phaseId != startAfterPhaseId;
    });
      
    plan.weekData = seasonSchedule;
    plan.weekData.forEach(week => {
      if (!week.raceData) {
        const raceData = racesByPhaseWeek[week.phaseId][week.weekdayStartDate];
        if (raceData && raceData.raceName !== '--') {
          week.raceData = raceData;
        }
      }
      if (week.raceData && week.raceData.raceCategory === 'A') {
        week.raceData.childRaces = Object.values(racesByPhaseWeek[week.phaseId]);
      }
    });

    // populate each row's data to display
    plan.rowData =
      chunks(seasonSchedule, SCHEDULE_ROW_LENGTH)
      .map(chunk => splitBy(chunk, week => week.phaseId));

    plan.rowDataMobile =
      chunks(seasonSchedule, SCHEDULE_ROW_LENGTH_MOBILE)
      .map(chunk => splitBy(chunk, week => week.phaseId));

    this._populateRaceData(plan.rowData, racesByPhaseWeek);
    this._populateRaceData(plan.rowDataMobile, racesByPhaseWeek);

    return plan;
  }

  private _populateRaceData(rowData, racesByPhaseWeek) {
    for (const row of rowData)
    for (const data of row) 
    for (const week of data) {
      if (!week.raceData) {
        const raceData = racesByPhaseWeek[week.phaseId][week.weekdayStartDate];
        if (raceData && raceData.raceName !== '--') { // skip empty races
          week.raceData = raceData;
        }
      }
      if (week.raceData && week.raceData.raceCategory === 'A') {
        // for an A race, populate child races (races from the same phase)
        week.raceData.childRaces = Object.values(racesByPhaseWeek[week.phaseId]);
      }
    }
  }
}
