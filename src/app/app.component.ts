import { Component, Renderer2, AfterContentInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ScriptService } from './athlete-portal/common-services/scripts-loader.service'
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { UpdateService } from './update.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';

  constructor(
    router: Router, 
    private scripts: ScriptService,
    private localeService: BsLocaleService,
    private renderer: Renderer2,
    private update: UpdateService
  ) {
    this.localeService.use('en-gb');

    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('/onboard/step-') || event.url.includes('/regconfirm'))
          this.renderer.addClass(document.body, 'onboarding-step');
      } else {
        this.renderer.removeClass(document.body, 'onboarding-step');
      }
    });
  }


}
