
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpRequest, HttpHandler, HttpInterceptor } from '@angular/common/http';
import { DEFAULT_ERROR_MESSAGE } from '../constants/constants';

const DEFAULT_ERROR = { 
  header: {
    status: '',
  },
  body: { 
    response: { 
      code: '',
      msg: '',
    }
  }
};

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}
  
  intercept(request: HttpRequest<any>, next: HttpHandler) {
    return next.handle(request).pipe(catchError(res => {
      try {
        if (this.router.url.includes('/onboard')) { // limit affected scope to onboarding
          const errorObj = {...DEFAULT_ERROR};
          if (typeof res.error === 'string') {
            errorObj.header.status = res.status.toString();
            errorObj.body.response.msg = res.error || DEFAULT_ERROR_MESSAGE;
            return observableThrowError(errorObj);
          } else if (typeof res.error === 'object') {
            errorObj.header.status = res.error.header && res.error.header.status;
            errorObj.body.response.code = res.error.body && res.error.body.response && res.error.body.response.code;
            errorObj.body.response.msg = res.error.body && res.error.body.response && res.error.body.response.msg || DEFAULT_ERROR_MESSAGE;
            return observableThrowError(errorObj);
          }
        }
        return observableThrowError(res);
      } catch (err) {
        console.error(err);
        return observableThrowError(res);
      }
    }));
  }
}