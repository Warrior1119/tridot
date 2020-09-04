import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class AuthenticationService {
    
    constructor(private router: Router) {}

    logout(isSessionExpired = false) {
        localStorage.clear();
        if (!this.router.url || this.router.url.includes('/login')) {
            return;
        }
        if (isSessionExpired) {
            this.router.navigate(['/login'], { queryParams: { isSessionExpired: true } });
        } else {
            this.router.navigate(['/login']);
        }
    }
}