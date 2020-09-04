import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit, AfterViewInit {
  display404 = false;
  queryParams = [];

  constructor(private router: Router, private route: ActivatedRoute, private cookieService: CookieService) { }
  @ViewChild('ssoRedirect') ssoRedirectForm;

  ngOnInit() {
    if (this.route.snapshot.url.join('/') === 'athletesvcs/zendesk/sso') {
      const token = localStorage.accessToken;
      if (token) {
        this.queryParams = this.route.snapshot.queryParamMap.keys.map(key => ({ name: encodeURIComponent(key), value: encodeURIComponent(this.route.snapshot.queryParams[key]) }))
        this.cookieService.set('accessToken', localStorage.accessToken);
        
      } else {
        this.router.navigate(['/login']);
      }
    } else {
      this.display404 = true;
    }
  }

  ngAfterViewInit() {
    if (!this.display404) {
      this.ssoRedirectForm.nativeElement.action = environment.API_ENDPOINT + '/athletesvcs/zendesk/sso';
      // this.ssoRedirectForm.nativeElement.action = 'http://api.tridot.com/athletesvcs/zendesk/sso';
      this.ssoRedirectForm.nativeElement.submit();
    }
  }
}
