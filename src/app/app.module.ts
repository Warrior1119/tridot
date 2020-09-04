import { NgModule, ErrorHandler } from '@angular/core';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { MemberPreferencesService } from "./athlete-portal/user/user-profile/preferences/member-preferences.service";
import { AuthenticationGuard } from './guards/authentication.guard';
import { AuthServiceConfig } from 'angularx-social-login';
import { FacebookLoginProvider } from 'angularx-social-login';
import { SessionService } from './athlete-portal/season-planner/session.service';
import { SeasonPlannerService } from './athlete-portal/season-planner/season-planner.service';
import { SeasonSharedDataService } from './athlete-portal/season-planner/season-shared-data.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { WeeklySummaryService } from './athlete-portal/season-planner/training-phase/weekly-summary/weekly-summary.service';
import { SeasonZoneSharedDataService} from './athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/session-zones/session-zones-shared.service';
import { SubscriptionGuard } from "./guards/subscription.guard";
import { OnboardService } from './onboard/onboard.service';
import { AddRenameSeasonComponent } from './athlete-portal/season-planner/add-rename-season/add-rename-season.component';
import { ConfirmationModalComponent } from './athlete-portal/common-components/confirmation-modal/confirmation-modal.component';
import { RaceDetailsMobileComponent } from './athlete-portal/season-planner/race-details-mobile/race-details-mobile.component';
import { DashboardServiceService } from './athlete-portal/common-services/dashboard-service.service';
import { SearchDetailsComponent } from './athlete-portal/search/search-details/search-details.component';
import { MoveCopyComponent } from './athlete-portal/season-planner/training-phase/weekly-summary/single-week/move-copy/move-copy.component';
import { UploadDataFileComponent } from './athlete-portal/season-planner/training-phase/weekly-summary/single-week/upload-data-file/upload-data-file.component';
import { AddComponent } from './athlete-portal/season-planner/training-phase/weekly-summary/single-week/add/add.component';
import { LinkSessionComponent } from './athlete-portal/season-planner/training-phase/weekly-summary/single-week/link-session/link-session.component';
import { ConstantsService } from './athlete-portal/constants/constants';
import { MetricsComponent } from './athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/metrics/metrics.component';
import { SessionTimepickerComponent } from './athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/session-timepicker/session-timepicker.component';
import { TrainingIntensitesHelpComponent } from './athlete-portal/training-intensities/training-intensites-help/training-intensites-help.component';
import { UnlinkedFilesComponent } from './athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/session-list/unlinked-files/unlinked-files.component';
import { AddEntryComponent } from './athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/add-entry/add-entry.component';
import { ManualCompletionModalComponent } from './athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/session-details/manual-completion-modal/manual-completion-modal.component';
import { RaceXService } from './athlete-portal/race-x/race-x.service';
import { UserProfileService } from './athlete-portal/user/user-profile/user-profile.service';
import { TrainIntensitiesService } from './athlete-portal/training-intensities/train-intensities.service';
import { AssessmentsService } from './athlete-portal/assessments/assessments.service';
import { AssessmentModalComponent } from './athlete-portal/assessments/assessment-modal/assessment-modal.component';
import { ScriptService } from './athlete-portal/common-services/scripts-loader.service';
import { ReferCoachComponent } from './athlete-portal/common-components/refer-coach/refer-coach.component';
import { AddTestimonialComponent } from './athlete-portal/coaches/coach-profile/add-testimonial/add-testimonial.component';
import { PhasePreferencesComponent } from './athlete-portal/season-planner/training-phase/phase-preferences/phase-preferences.component';
import { OnboardGuard } from './guards/onboard.guard';
import { AuthenticationService } from './athlete-portal/common-services/authentication.service';
import { CookieService } from 'ngx-cookie-service';
import { LocalstorageService } from './athlete-portal/common-services/localstorage.service';
import { LocalStorage } from './athlete-portal/common-services/local-storage';
import { BrowserUtil } from './utils/browser-util';
import { ScrollService } from './athlete-portal/common-services/scroll.service';
import { AddEntryMultipleComponent } from './athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/add-entry-multiple/add-entry-multiple.component';
import { SupportService } from './athlete-portal/user/support/support.service';
import { GlobalService } from './athlete-portal/common-services/global.service';
import { AuthInterceptor } from './athlete-portal/common-services/auth.interceptor';
import { UpdateService } from './update.service';
import { CoachesService } from './athlete-portal/coaches/coaches.service';
import { SwimFormService } from './athlete-portal/swimform/swimform.service';
import { SwimFormDiagnosticsComponent } from './athlete-portal/swimform/swim-form-diagnostics/swim-form-diagnostics-modal.component';
import { SubmitRequestComponent } from './athlete-portal/user/support/submit-request/submit-request.component';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { AlertsComponent } from './athlete-portal/common-components/alerts/alerts.component';
import { AppErrorHandler } from './athlete-portal/common-services/error-handler';
import { LaneLineTestHelpComponent } from './athlete-portal/swimform/swim-form-diagnostics/lane-line-test-help/lane-line-test-help.component';
import { MyBikesLearnMoreModalComponent } from './athlete-portal/user/user-profile/my-bikes/my-bikes-learn-more-modal/my-bikes-learn-more-modal.component';
import { CancelSubscriptionModalComponent } from './athlete-portal/user/subscription-options/cancel-subscription-modal/cancel-subscription-modal.component';

import { LayoutModule } from './layout/layout.module';
import { RoutesModule } from './routes/routes.module';
import { GeolocationService } from './athlete-portal/common-services/geolocation.service';

import { UpcomingRacesService} from './athlete-portal/race-x/upcoming-races/upcoming-races.service';
import { HeaderService } from './layout/header/header.service';
import { SidebarService } from './layout/sidebar/sidebar.service';
import { MessageModalComponent } from './athlete-portal/common-components/message-modal/message-modal.component';
import { RaceXSurveyComponent } from './athlete-portal/race-x/race-x-survey/race-x-survey.component';
import {TextEncodeDecode} from './athlete-portal/common-model/textEncodeDecode.modal';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatButtonModule, MatSnackBarModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UpdateAppModalComponent } from './../app/athlete-portal/common-components/update-app-modal/update-app-modal.component';
import { BrowserScrollService } from './utils/browser-scroll-service';
import { EmailVerificationComponent } from './athlete-portal/email-verification/email-verification.component';
import { BeginnerModalComponent } from './onboard/beginner-modal/beginner-modal.component';
import { SlackService } from './athlete-portal/common-services/slack.service';
import { WelcomeModalComponent } from './onboard/welcome-modal/welcome-modal.component';
import { EmailVerificationInlineComponent } from './athlete-portal/email-verification-inline/email-verification-inline.component';
import { GeneticsService } from './routes/genetics/genetics.service';
import { AthleteCancellationService } from './athlete-portal/user/user-profile/athlete-cancellation.service';
import { StripeGatewayService } from './athlete-portal/user/subscription-options/stripe-gateway.service';
import { ChartsModule } from 'ng2-charts';
import { WorkoutExportPreferencesService } from './athlete-portal/user/user-profile/preferences/notification-preferences/workout-export-preferences/workout-export-preferences.service';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

const config = new AuthServiceConfig([
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider('1570860616499675')
  }
]);

export function provideConfig() {
  return config;
}

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ChartsModule,

    LayoutModule,
    RoutesModule,

    MatSnackBarModule,
    MatButtonModule,
    ServiceWorkerModule.register('ngsw-custom-worker.js')
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    TextEncodeDecode,
    AuthenticationGuard,
    SessionService,
    WeeklySummaryService,
    SeasonZoneSharedDataService,
    OnboardService,
    HeaderService,
    BsModalService,
    SeasonPlannerService,
    ConstantsService,
    SeasonSharedDataService,
    AthleteCancellationService,
    UserProfileService,
    MemberPreferencesService,
    WorkoutExportPreferencesService,
    StripeGatewayService,
    GeneticsService,
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    { provide: ErrorHandler, useClass: AppErrorHandler },
    DashboardServiceService,
    RaceXService,
    TrainIntensitiesService,
    AssessmentsService,
    ScriptService,
    OnboardGuard,
    SubscriptionGuard,
    CookieService,
    LocalStorage,
    LocalstorageService,
    SupportService,
    GlobalService,
    SlackService,
    CoachesService,
    SwimFormService,
    GeolocationService,
    UpcomingRacesService,
    SidebarService,
    AuthenticationService,
    UpdateService,
    BrowserUtil,
    ScrollService,
    BrowserScrollService
  ],
  entryComponents: [
    AddEntryComponent,
    AddEntryMultipleComponent,
    UnlinkedFilesComponent,
    MetricsComponent,
    TrainingIntensitesHelpComponent,
    LinkSessionComponent,
    AddComponent,
    UploadDataFileComponent,
    MoveCopyComponent,
    AddRenameSeasonComponent,
    ConfirmationModalComponent,
    BeginnerModalComponent,
    WelcomeModalComponent,
    SessionTimepickerComponent,
    ManualCompletionModalComponent,
    MyBikesLearnMoreModalComponent,
    CancelSubscriptionModalComponent,
    SwimFormDiagnosticsComponent,
    SearchDetailsComponent,
    AssessmentModalComponent,
    ReferCoachComponent,
    AddTestimonialComponent,
    PhasePreferencesComponent,
    SubmitRequestComponent,
    AlertsComponent,
    LaneLineTestHelpComponent,
    MessageModalComponent,
    RaceXSurveyComponent,
    UpdateAppModalComponent,
    RaceDetailsMobileComponent,
    EmailVerificationComponent,
    EmailVerificationInlineComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
