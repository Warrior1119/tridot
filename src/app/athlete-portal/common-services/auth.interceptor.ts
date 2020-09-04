
import {tap} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { LocalstorageService } from './localstorage.service';
import { SwUpdate } from '@angular/service-worker';
import { CommonUtils } from './../common-util/common-utils';

const IGNORED_URLS = [
  'hooks.slack.com',
  '/onboard',
  'confirmemail',
  'resetpassword',
  'resendverifyemail',

];

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
      private router: Router,
      private authenticationService: AuthenticationService,
      private localstorageService: LocalstorageService,
      private swUpdate: SwUpdate,
    ) {}
    setHeaders;
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if(request.url && CommonUtils.isKeyAPI(request.url)) {
          this.swUpdate.checkForUpdate().then(() => console.log('Checking for Update'));
        }
        if (request.url && IGNORED_URLS.some(ignoredUrl => request.url.includes(ignoredUrl))) {
          return next.handle(request);
        }
        if(this.localstorageService.getIsCoachAccess()){
         this.setHeaders = {
            Authorization: `Bearer ${this.localstorageService.getAccessToken()}`,
            CoachRunAs: ''+this.localstorageService.getMemberId()
          }
        }
        else{
          if (this.localstorageService.isCoachLogin()) {
            this.setHeaders = {
              Authorization: `Bearer ${this.localstorageService.getCoachAccessToken()}`,

            }
          } else {
            this.setHeaders = {
              Authorization: `Bearer ${this.localstorageService.getAccessToken()}`,

            }
          }
        }
        request = request.clone({
          setHeaders: this.setHeaders
        });
        return next.handle(request).pipe(tap((event: HttpEvent<any>) => {}, (err: any) => {
          if (err instanceof HttpErrorResponse) {
              if (err.status === 500) {
                const errRes = err.error;
                if(errRes && errRes.body && errRes.body.response.code === '18002') {
                  const profile = this.localstorageService.getAthleteProfileIfExists();
                  if (profile && (!profile.subscriptionId || +profile.subscriptionDaysRemain < 0)) {
                    this.router.navigate(['/user/subscription-options']);
                  } else {
                    console.log('Session Expired redirecting to Login Screen');
                    this.authenticationService.logout(true);
                  }
                }
              }
            }
          }));
    }
}
