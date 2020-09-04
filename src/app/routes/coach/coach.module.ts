import { NgModule } from '@angular/core';
import { CoachAthletePreviewPanelComponent } from "../../coach-portal/athletes/athlete-preview-panel/coach-athlete-preview-panel.component";
import { CoachContactInfoComponent } from "../../coach-portal/profile/coach-contact-info/coach-contact-info.component";
import { CoachInfoComponent } from "../../coach-portal/profile/coach-info/coach-info.component";
import { CoachPhotosComponent } from "../../coach-portal/profile/coach-photos/coach-photos.component";
import { CoachPhotosService } from "../../coach-portal/profile/coach-photos/coach-photos.service";
import { CoachTestimonialsComponent } from "../../coach-portal/profile/coach-testimonials/coach-testimonials.component";
import { CoachTestimonialsService } from "../../coach-portal/profile/coach-testimonials/coach-testimonials.service";
import { SharedModule } from '../../shared/shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CoachRoutes } from './coach.routing';
import { CoachProfileComponent } from '../../coach-portal/profile/coach-profile.component';
import { CoachAthletesComponent } from '../../coach-portal/athletes/coach-athletes.component';
import { CoachPortalService } from '../../coach-portal/coach-portal.service';
import { CoachAthleteRowComponent } from '../../coach-portal/athletes/athlete-row/coach-athlete-row.component';
import { CoachAuthInterceptor } from '../../athlete-portal/common-services/coach-auth.interceptor';
import { CoachSeatInfoComponent } from '../../coach-portal/profile/coach-seat-info/coach-seat-info.component';
import { CoachSubscriptionOptionsComponent } from '../../coach-portal/coach-subscriptions-options/coach-subscription-options.component';
import { CoachCheckoutComponent } from '../../coach-portal/coach-checkout/coach-checkout.component';
import { CoachSubscriptionService } from '../../coach-portal/coach-subscription.service';

const COMPONENTS = [
  CoachProfileComponent,
  CoachAthletesComponent,
  CoachAthleteRowComponent,
  CoachAthletePreviewPanelComponent,
  CoachPhotosComponent,
  CoachInfoComponent,
  CoachContactInfoComponent,
  CoachTestimonialsComponent,
  CoachSeatInfoComponent,
  CoachSubscriptionOptionsComponent,
  CoachCheckoutComponent,
];

@NgModule({
  imports: [
    SharedModule,
    CoachRoutes
  ],
  declarations: COMPONENTS,
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: CoachAuthInterceptor, multi: true },
    CoachPortalService,
    CoachPhotosService,
    CoachTestimonialsService,
    CoachSubscriptionService
  ],
  exports: COMPONENTS,
  entryComponents: [
    CoachAthletePreviewPanelComponent,
  ]
})
export class CoachModule { }
