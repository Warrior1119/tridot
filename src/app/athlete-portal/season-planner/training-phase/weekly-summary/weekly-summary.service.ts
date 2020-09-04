
import {throwError as observableThrowError,  Observable ,  Subject ,  forkJoin } from 'rxjs';

import {catchError} from 'rxjs/operators';
import * as moment from 'moment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { LocalstorageService } from './../../../common-services/localstorage.service';

@Injectable()
export class WeeklySummaryService {
  private weeks = new Subject<any>();
  constructor(private http: HttpClient,
    private localstorageService: LocalstorageService) {}

  private get accessToken() {
    return localStorage.accessToken;
  }

  getWeeksFromApi(): any {
    return this.http.get(environment.MOCK_ENDPOINT + 'c3yzi')
      .subscribe((res) => this.weeks.next(res));
  }

  getWeeks(): Observable<any> {
    return this.weeks.asObservable();
  }

  getMultiWeeks(fromDate, toDate, coords?: {latitude: number, longitude: number}): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/multiweek',
      {
        header: {
          accessToken: this.accessToken,
          latitude: coords && coords.latitude,
          longitude: coords && coords.longitude,
        },
        body: { athleteId: this.localstorageService.getMemberId(), fromDate: fromDate, toDate } }).pipe(
      catchError(res => observableThrowError(res)));
  }

  restore(fromDate, id, restoreType): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/restore',
      {
        header: { accessToken: this.accessToken }, body: {
          athleteId: this.localstorageService.getMemberId(),
          fromDate: fromDate,
          restoreType: restoreType,
          fromSessionId: (restoreType === 'session') ? id : '',
          phaseId: (restoreType === 'day') ? id : ''
        }
      }).pipe(catchError(res => observableThrowError(res)));
  }

  move(fromDate, toDate, id, moveType): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/move',
      {
        header: { accessToken: this.accessToken }, body: {
          athleteId: this.localstorageService.getMemberId(),
          fromDate: fromDate,
          toDate: toDate,
          moveType: moveType,
          fromSessionId: (moveType === 'session') ? id : '',
          phaseId: (moveType === 'day') ? id : ''
        }
      }).pipe(catchError(res => observableThrowError(res)));
  }

  copy(fromDate, toDate, id, copyType): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/copy',
      {
        header: { accessToken: this.accessToken }, body: {
          athleteId: this.localstorageService.getMemberId(),
          fromDate: fromDate,
          toDate: toDate,
          copyType: copyType,
          fromSessionId: (copyType === 'session') ? id : '',
          phaseId: (copyType === 'day') ? id : ''
        }
      }).pipe(catchError(res => observableThrowError(res)));
  }

  add(date: string, newSession, phaseId: number): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/add',
      {
        header: { accessToken: this.accessToken }, body: {
          'athleteId': this.localstorageService.getMemberId(),
          'sessionId': 123,
          'sessionType': newSession.sessionType,
          'date': date,
          'dayName': null,
          'phaseId': phaseId,
          'sessionName': newSession.sessionType,
          'sessionTime': newSession.sessionTime,
          'sessionZoneLabel': `${newSession.sessionType.toUpperCase()} Session`,
          'plannedTotal': newSession.plannedTotal,
          'actualTotal': '',
          'location': newSession.location,
          'image': `images/${newSession.sessionType}-new.png`,
          'isLinkedFile': false,
          'isSystemGenerated': false,
          'isCoachCreated': false,
          'isCoachAdjusted': '',
          'isAthleteCreated': true,
          'indoor': null,
          'msCompletion': null,
          'wuCompletion': null,
          'sessionLevel': '',
          'isMovedToDifferentWeek': false,
          'isFromDifferentWeek': false,
          'linkedFiles': [

          ],
          'zones': [
            {
              'zoneType': 'z1',
              'zoneLabel': '',
              'planned': '',
              'actual': '',
              'percentage': '',
              'pace': '',
              'rpe': '',
              'power': '',
              'hr': ''
            },
            {
              'zoneType': 'z2',
              'zoneLabel': '',
              'planned': '',
              'actual': '',
              'percentage': '',
              'pace': '',
              'rpe': '',
              'power': '',
              'hr': ''
            },
            {
              'zoneType': 'z3',
              'zoneLabel': '',
              'planned': '',
              'actual': '',
              'percentage': '',
              'pace': '',
              'rpe': '',
              'power': '',
              'hr': ''
            },
            {
              'zoneType': 'z4',
              'zoneLabel': '',
              'planned': '',
              'actual': '',
              'percentage': '',
              'pace': '',
              'rpe': '',
              'power': '',
              'hr': ''
            },
            {
              'zoneType': 'z5',
              'zoneLabel': '',
              'planned': '',
              'actual': '',
              'percentage': '',
              'pace': '',
              'rpe': '',
              'power': '',
              'hr': ''
            },
            {
              'zoneType': 'z6',
              'zoneLabel': '',
              'planned': '',
              'actual': '',
              'percentage': '',
              'pace': '',
              'rpe': '',
              'power': '',
              'hr': ''
            }
          ],
          'achievement': null,
          'sessionVideos': null,
          'interference': [
            0
          ],
          'sessionDetail': newSession.sessionDetail,
          'myNotes': [

          ],
          'sessionNotes': [

          ],
          'sessionChats': [

          ],
          'warmUpDuration': null,
          'addlData': {
          }
        }
      }).pipe(catchError(res => observableThrowError(res)));
  }

  async updateDayData(data, sessionId, position?: {lat, lng}): Promise<any> {
    data.athleteId = this.localstorageService.getMemberId();
    data.sessionId = sessionId;

    if (position) {
      data.latitude = position.lat;
      data.longitude = position.lng;
    } else if (
      typeof data.indoor !== 'undefined'
      || typeof data.location !== 'undefined'
    ) {
      const {coords} = await this._getCurrentPosition();
      data.latitude = coords && coords.latitude;
      data.longitude = coords && coords.longitude;
    }

    try {
      console.log(data)
      const res = await this.http.patch(
        environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/partialUpdate',
        data).toPromise();
        console.log("resutl "+ JSON.stringify(res))
      return res;
    } catch (err) {
      throw err;
    }
  }

  updateNotes(notes, sessionId): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/addmynotes',
      {
        header: { accessToken: this.accessToken }, body: {
          athleteId: this.localstorageService.getMemberId(),
          sessionId: sessionId,
          notes: notes
        }
      }).pipe(catchError(res => observableThrowError(res)));
  }

  updateCoachNotes(coachNotes, sessionId): any {
    return this.http.post(environment.API_ENDPOINT + `/athletesvcs/coach/sessions/${sessionId}/notes`,
      {
        header: { accessToken: this.accessToken }, body: {
          athleteId: this.localstorageService.getMemberId(),
          coachId: this.localstorageService.getCoachId(),
          sessionId: sessionId,
          notes: coachNotes
        }
      }).pipe(catchError(res => observableThrowError(res)));
  }


  delete(fromDate, id, deleteType): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/delete',
      {
        header: { accessToken: this.accessToken }, body: {
          athleteId: this.localstorageService.getMemberId(),
          fromDate: fromDate,
          deleteType: deleteType,
          fromSessionId: (deleteType === 'session') ? id : '',
          phaseId: (deleteType === 'day') ? id : ''
        }
      }).pipe(catchError(res => observableThrowError(res)));
  }

  uploadFile(sessionType, id, file, isApproved?: boolean): any {
    console.log(file);

    const jsonData = {
      header: { accessToken: this.accessToken }, body: {
        userType: 'athelete',
        userId: this.localstorageService.getMemberId(),
        sessionId: id,
        sessionType: sessionType,
      }
    } as any;
    if (isApproved) {
      jsonData.body.isApproved = true;
    }

    console.log(jsonData, file);

    const request = new FormData();
    request.append('uploadMetaData', JSON.stringify(jsonData));
    request.append('file', file);

    return this.http.post(environment.API_ENDPOINT + '/dipsvc/file/schedule/receive', request).pipe(
      catchError(res => observableThrowError(res)));
  }

  weekWorkload(startDate): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/weekworkload',
      {
        header: { accessToken: this.accessToken }, body: {
          athleteId: this.localstorageService.getMemberId(),
          weekStartDate: startDate
        }
      }).pipe(
      catchError(res => observableThrowError(res)));
  }

  multiWeekScores(startDate: Date, count: number): any {
    const requests = [];
    const date = new Date(startDate.getTime());
    for (let index = 0; index < count; index++) {
      const dateStr = this._formatDate(date);
      const request = this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/weekworkload',
        {
          header: { accessToken: this.accessToken }, body: {
            athleteId: this.localstorageService.getMemberId(),
            weekStartDate: dateStr
          }
        });
      date.setDate(date.getDate() - 7);
      requests.push(request);
    }
    return forkJoin(requests);
  }

  unlinkFile(sessionId): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/unlinkFiles',
      {
        header: { accessToken: this.accessToken }, body: {
          athleteId: this.localstorageService.getMemberId(),
          sessionId: sessionId
        }
      }).pipe(
      catchError(res => observableThrowError(res)));
  }

  getSessionVideos(sessionId): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/sessionvids',
      {
        header: { accessToken: this.accessToken }, body: {
          sessionId: sessionId
        }
      }).pipe(
      catchError(res => observableThrowError(res)));
  }

  getWeather(date: string, sessionTime: string, lookupType: string, coords: {latitude: number, longitude: number}, sessionid?: string): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/weather/closestWeather',
      {
        header: {
          accessToken: this.accessToken,
          latitude: coords && coords.latitude,
          longitude: coords && coords.longitude,
        },
        body: {
          assessmentDate: date,
          athleteId: this.localstorageService.getMemberId(),
          lookupType,
          assessmentTime: sessionTime,
          sessionid
        }
      }).pipe(
      catchError(res => observableThrowError(res)));
  }

  createSessionFromFile(trainingsessionFileMetaId): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/createsessionfromfile',
      {
        header: { accessToken: this.accessToken }, body: {
          athleteId: this.localstorageService.getMemberId(),
          trainingsessionFileMetaId: trainingsessionFileMetaId
        }
      }).pipe(
      catchError(res => observableThrowError(res)));
  }

  deleteUnlinkedFile(trainingsessionFileMetaId): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/deletesessionfile',
      {
        header: { accessToken: this.accessToken }, body: {
          athleteId: this.localstorageService.getMemberId(),
          trainingsessionFileMetaId: trainingsessionFileMetaId
        }
      }).pipe(
      catchError(res => observableThrowError(res)));
  }

  fetchAllIncompleteSessions(trainingsessionFileMetaId, trainingsessionType, trainingsessionFileMetaDate): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/fetchAllIncompleteSessions',
      {
        header: { accessToken: this.accessToken }, body: {
          athleteId: this.localstorageService.getMemberId(),
          trainingsessionFileMetaId: trainingsessionFileMetaId,
          trainingsessionType: trainingsessionType,
          trainingsessionFileMetaDate: trainingsessionFileMetaDate
        }
      }).pipe(
      catchError(res => observableThrowError(res)));
  }

  link(trainingsessionFileMetaId, sessionId): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/link',
      {
        header: { accessToken: this.accessToken }, body: {
          athleteId: this.localstorageService.getMemberId(),
          trainingsessionFileMetaId: trainingsessionFileMetaId,
          sessionId: sessionId
        }
      }).pipe(
      catchError(res => observableThrowError(res)));
  }

  merge(trainingsessionFileMetaId: number[], sessionId: string): any {
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/merge',
      {
        header: { accessToken: this.accessToken },
        body: {
          athleteId: this.localstorageService.getMemberId(),
          trainingsessionFileMetaId,
          sessionId
        }
      }).pipe(
      catchError(res => observableThrowError(res)));
  }

  getMetricsForDay(date): any {
    return this.http.get( environment.API_ENDPOINT
        + '/athletesvcs/athlete/schedule/getMetricsDetails?athleteId='
        + this.localstorageService.getMemberId() +  '&date=' + date).pipe(
      catchError(res => observableThrowError(res))).toPromise();
  }

  async getConnectedMetrics(): Promise<any> {
    const res: any = await this.http.get(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/getConnectedMetrics?athleteId=' + this.localstorageService.getMemberId()).toPromise();

    const selectedMetrics = res.body.response;
    return selectedMetrics;
  }
  async getSelectedMetrics(): Promise<any> {
    const res: any = await this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/getmetricstotrack',
      {
        header: { accessToken: this.accessToken }, body: {
          athleteId: this.localstorageService.getMemberId()
        }
      }).toPromise();

    const selectedMetrics = res.body.response;
    selectedMetrics.displayList = selectedMetrics.displayList || [];
    selectedMetrics.trackList = selectedMetrics.trackList || [];

    return selectedMetrics;
  }
  async getSessionZonesForAdd(): Promise<any> {
    const res: any = await this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/sessionzonesforadd',
      {
        header: { accessToken: this.accessToken }, body: {
          athleteId: this.localstorageService.getMemberId(),
          coachId: this.localstorageService.getCoachId()
        }
      }).toPromise();


    console.log("coach id = " + this.localstorageService.getCoachId() + " zonesfor add " + JSON.stringify(res.body.response))
    const zonesForAdd = res.body.response;
    return zonesForAdd;

  }

  async getSessionStacks(zoneId, sessionType): Promise<any> {
    const res: any = await this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/sessionstacksforadd',
      {
        header: { accessToken: this.accessToken }, body: {
          athleteId: this.localstorageService.getMemberId(),
          coachId: this.localstorageService.getCoachId(),
          primaryZoneId: zoneId,
          sessionType: sessionType
        }
      }).toPromise();
    console.log("stack " + JSON.stringify(res.body.response))
    const sessionStacks = res.body.response;
    return sessionStacks;
  }

  addCoachTridotSession(newSession): any{
   console.log("req session "+ JSON.stringify(newSession))
    return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/tridotstackadd',
    {
      header: { accessToken: this.accessToken }, body: {
        athleteId: this.localstorageService.getMemberId(),
        sessionType: newSession.sessionType,
        date: newSession.date,
        dayName: newSession.dayName,
        phaseId: newSession.phaseId,
        sessionName: newSession.sessionName,
        sessionTime: newSession.sessionTime,
        plannedTotal: newSession.plannedTotal,
        actualTotal: newSession.actualTotal,
        isSystemGenerated: newSession.isSystemGenerated,
        isCoachCreated: newSession.isCoachCreated,
        isCoachAdjusted: newSession.isCoachAdjusted,
        isAthleteCreated: newSession.isAthleteCreated,
        sessionStackId: newSession.sessionStackId,
        sessionStackName: newSession.sessionStackName,
        sessionLevel: newSession.sessionLevel,
        warmUpDuration: newSession.warmUpDuration,
        warmUpImpact: newSession.warmUpImpact
      }
    }).pipe(catchError(res => observableThrowError(res)));
  }

  addCoachBlankSession(newSession): any{
    console.log("req sesion "+ JSON.stringify(newSession))
     return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/add',
     {
       header: { accessToken: this.accessToken }, body: {
        'athleteId': this.localstorageService.getMemberId(),
        'sessionId': 123,
        'sessionType': newSession.sessionType.toLowerCase(),
        'date': newSession.date,
        'dayName': null,
        'phaseId': newSession.phaseId,
        'sessionName': newSession.sessionType,
        'sessionTime': newSession.sessionTime,
        'sessionZoneLabel': 'SWIM Session',
        'plannedTotal': newSession.plannedTotal,
        'actualTotal': '',
        'location': newSession.location,
        'image': `images/${newSession.sessionType.toLowerCase()}-new.png`,
        'isLinkedFile': false,
        'isSystemGenerated': false,
        'isCoachCreated': true,
        'isCoachAdjusted': '',
        'isAthleteCreated': false,
        'indoor': null,
        'msCompletion': null,
        'wuCompletion': null,
        'sessionLevel': '',
        'isMovedToDifferentWeek': false,
        'isFromDifferentWeek': false,
        'linkedFiles': [

        ],
        'zones': [
          {
            'zoneType': 'z1',
            'zoneLabel': '',
            'planned': '',
            'actual': '',
            'percentage': '',
            'pace': '',
            'rpe': '',
            'power': '',
            'hr': ''
          },
          {
            'zoneType': 'z2',
            'zoneLabel': '',
            'planned': '',
            'actual': '',
            'percentage': '',
            'pace': '',
            'rpe': '',
            'power': '',
            'hr': ''
          },
          {
            'zoneType': 'z3',
            'zoneLabel': '',
            'planned': '',
            'actual': '',
            'percentage': '',
            'pace': '',
            'rpe': '',
            'power': '',
            'hr': ''
          },
          {
            'zoneType': 'z4',
            'zoneLabel': '',
            'planned': '',
            'actual': '',
            'percentage': '',
            'pace': '',
            'rpe': '',
            'power': '',
            'hr': ''
          },
          {
            'zoneType': 'z5',
            'zoneLabel': '',
            'planned': '',
            'actual': '',
            'percentage': '',
            'pace': '',
            'rpe': '',
            'power': '',
            'hr': ''
          },
          {
            'zoneType': 'z6',
            'zoneLabel': '',
            'planned': '',
            'actual': '',
            'percentage': '',
            'pace': '',
            'rpe': '',
            'power': '',
            'hr': ''
          }
        ],
        'achievement': null,
        'sessionVideos': null,
        'interference': [
          0
        ],
        'sessionDetail': newSession.sessionDetail,
        'myNotes': [

        ],
        'sessionNotes': [

        ],
        'sessionChats': [

        ],
        'warmUpDuration': null,
        'warmUpImpact': ""+newSession.warmUpImpact,
        'addlData': {
        }

       }
     }).pipe(catchError(res => observableThrowError(res)));
   }

  async getMetricsToDisplay(selectedMetrics, date): Promise<any> {
    const metricsToDisplay = [];
    try {
      if (date.indexOf("-") != -1) {
        date = moment(date, 'YYYY-MM-DD').format('MM/DD/YYYY');
      }
      const metricData: any = await this.getMetricsForDay(date);
      const metricLst         = metricData.body.response.metrics;

      for (const metric of metricLst) {
        const id = metric.metricId;
        if (selectedMetrics.trackList.includes(id)) {
            const met = Object.assign({}, metric);
            met.isSelected  = true;
            if (met.values && Array.isArray(met.values)) {
              met.values =  met.values.map(value => value.replace(/"/g, ''));
            }
            met.model = met.selectedValue ? met.selectedValue : '';
            metricsToDisplay.push(met);
        }
      }
    } catch (err) {
      console.error(err);
    }
    return metricsToDisplay;
  }

  async saveMetrics(metrics): Promise<any> {
    await this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/savemetricstotrack',
      {
        header: { accessToken: this.accessToken }, body: {
          athleteId: this.localstorageService.getMemberId(),
          displayList: metrics.displayList,
          trackList: metrics.trackList
        }
      }).toPromise();
  }


  async getMetricValues(): Promise<any> {
    const res: any = await this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/getmetricsvalues',
      {
        header: { accessToken: this.accessToken }, body: {}
      }).toPromise();
    return res.body.response;
  }

  async saveMetricValues(metrics, metricsDate): Promise<any> {
    await this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/savemetricsvalues',
      {
        header: { accessToken: this.accessToken }, body: {
          athleteId: this.localstorageService.getMemberId(),
          metrics: metrics,
          metricsDate: moment(metricsDate).format('MM/DD/YYYY'),
        }
      }).toPromise();
  }

  getNextDate(date): any {
    return this.http.get(environment.API_ENDPOINT + '/athletesvcs/athlete/schedule/dayDetails?date=' + date).pipe(
      catchError(res => observableThrowError(res)));
  }

  getSessionLinkedData(fileId: string): any {
    return this.http.get(environment.API_ENDPOINT + '/dipsvc/file/ui/sessionget/' + fileId).pipe(
      catchError(res => observableThrowError(res)));
  }

  getSessionLegacyStats(sessionId: string, fileId: string, ext: string): any {
    return this.http.get(environment.API_ENDPOINT + `/dipsvc/file/schedule/sessionget/${this.localstorageService.getMemberId()}/${sessionId}/${fileId}/${ext}`,
      {
        headers: this.localstorageService.getAuthHeaders()
      }).pipe(
      catchError(res => observableThrowError(res)));
  }

  async coachScheduleUpdate(session): Promise<any> {
    const request = {
      header: { accessToken: this.accessToken },
      body: session
    };
    return this.http.post<any>(`${environment.API_ENDPOINT}/athletesvcs/athlete/schedule/update`, request).toPromise();
  }

  updateWeatherData(sessionId: any, overrides: any): any {
    const request = {
      header: { accessToken: this.accessToken },
      body: {
        overrideTemp: overrides.overrideTemp,
        overrideHumidity: overrides.overrideHumidity,
        overrideElevation: overrides.overrideElevation,
      },
    };
    return this.http.post<any>(`${environment.API_ENDPOINT}/athletesvcs/athlete/files/re-process/session/${sessionId}`, request).toPromise();
  }

  private async _getCurrentPosition(): Promise<any> {
    return new Promise<{coords:{longitude:number, latitude:number}}>((resolve, reject) => {
      if (!navigator.geolocation) {
        resolve();
      }
      navigator.geolocation.getCurrentPosition(position => resolve(position), err => resolve({coords: null}), {timeout: 5000});
    });
  }

  private _formatDate(date) {
    if (!date) {
      return '';
    }
    return moment(date).format('MM/DD/YYYY');
  }

}
