import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class LocalstorageService {

  constructor(private authService: AuthenticationService) { }

  public getAthleteProfileIfExists() {
    const accessToken = this.getAccessToken();
    const coachAccessToken = this.getCoachAccessToken();
    if (accessToken || coachAccessToken) {
      let athleteProfile: string = localStorage.getItem('athleteProfile');
      if(!athleteProfile || athleteProfile === 'undefined' || athleteProfile === 'null'){
        athleteProfile = '{}';
      }
      return JSON.parse(athleteProfile);

    } else {
      this.authService.logout();
      return {};
    }
  }

  public getCoachProfileIfExists() {
    const accessToken = this.getAccessToken();
    const coachAccessToken = this.getCoachAccessToken();
    if (accessToken || coachAccessToken) {
      let coachProfile: string = localStorage.getItem('coachProfile');
      if(!coachProfile || coachProfile === 'undefined'){
        coachProfile = '{}';
      }
      return JSON.parse(coachProfile);
    } else {
      this.authService.logout();
      return {};
    }
  }

  public getOnBoardProfileIfExists() {
    const accessToken = this.getAccessToken();
    if (accessToken) {
      let profile: string = localStorage.getItem('tridot.onboardinguser');
      if(!profile || profile === 'undefined'){
        profile = '{}';
      }
      return JSON.parse(profile);
    } else {
      this.authService.logout();
      return {};
    }
  }

  public getAccessToken(): string {
    if(window.localStorage || localStorage){
        return localStorage.getItem('accessToken');
    }
    return null;
  }

  public getCoachAccessToken(): string {
    if(window.localStorage || localStorage){
      return localStorage.getItem('coachAccessToken');
    }
    return null;
  }

  public getAuthHeaders(): any {
    return {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${this.getAccessToken()}` })
    };
  }

  public hasUserSignedIn(): boolean {
    return this.getAccessToken() || this.getCoachAccessToken() ? true : false;
  }

  public getMemberId(): string {
    return this.getAthleteProfileIfExists().athleteId;
  }

  public getIsCoachAccess(){
    if(window.localStorage || localStorage){
      return localStorage.getItem('isCoachAccess');
    }
    return false;
  }

  public getUserType() {
    if(window.localStorage || localStorage){
      return localStorage.getItem('userType');
    }
  }

  public isCoachLogin(): boolean {
    return this.getUserType() === 'coach';
  }

  public getCoachId(){
    return this.getAthleteProfileIfExists().coach.coachId;
  }
}
