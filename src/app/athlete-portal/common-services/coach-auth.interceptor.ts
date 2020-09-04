
import {tap} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { LocalstorageService } from './localstorage.service';
import { SwUpdate } from '@angular/service-worker';
import { CommonUtils } from '../common-util/common-utils';

const IGNORED_URLS = [
  'hooks.slack.com', 
  '/onboard',
  'confirmemail',
  'resetpassword',
  'resendverifyemail',
  
];

@Injectable()
export class CoachAuthInterceptor implements HttpInterceptor {
    constructor(
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
        this.setHeaders = {
          Authorization: `Bearer ${this.localstorageService.getCoachAccessToken()}`,
        }
        request = request.clone({
          setHeaders: this.setHeaders
        });
        return next.handle(request).pipe(tap((event: HttpEvent<any>) => {}, (err: any) => {
          if (err instanceof HttpErrorResponse) { 
            if (err.status === 500) {
              const errRes = err.error;
              if(errRes && errRes.body && errRes.body.response.code === '18002') {
                  console.log('Session Expired redirecting to Login Screen'); 
                  this.authenticationService.logout(true);
              }
            }
          }
        }));
    }
}