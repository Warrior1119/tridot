import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';


import { Injectable } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { LocalstorageService } from './../../common-services/localstorage.service';

@Injectable()
export class UpcomingRacesService {

    constructor(private http: HttpClient, private localstorageService: LocalstorageService){}

    private get accessToken() {
      return localStorage.accessToken;
    }

    async getRaces() {
      const res: any = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/dash/myraces`,
        { header: { accessToken: this.accessToken }, 
          body: { memberId: this.localstorageService.getMemberId() } }).toPromise();
      return res.body.response;   
  }
}