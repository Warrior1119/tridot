import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SubscriptionGuard } from "../guards/subscription.guard";
import { SharedModule } from '../shared/shared.module';

import { LayoutComponent } from '../layout/layout.component';
import { EmailSentComponent } from '../athlete-portal/login/forgot-password/email-sent/email-sent.component';
import { SignUpComponent } from '../onboard/sign-up/sign-up.component';
import { Step1Component } from '../onboard/step-1/step-1.component';
import { Step2Component } from '../onboard/step-2/step-2.component';
import { Step3Component } from '../onboard/step-3/step-3.component';
import { Step4Component } from '../onboard/step-4/step-4.component';
import { EmailConfirmComponent } from '../onboard/email-confirm/email-confirm.component';
import { Step5Component } from '../onboard/step-5/step-5.component';
import { LoginComponent } from '../athlete-portal/login/login.component';
import { CoachAthleteLoginComponent } from '../athlete-portal/login/coach-athlete-login/coach-athlete-login.component';
import { ForgotPasswordComponent } from '../athlete-portal/login/forgot-password/forgot-password.component';
import { RaceXComponent } from '../athlete-portal/race-x/race-x.component';
import { SeasonPlannerComponent } from '../athlete-portal/season-planner/season-planner.component';
import { TrainingPhaseComponent } from '../athlete-portal/season-planner/training-phase/training-phase.component';
import { AddARaceComponent } from '../athlete-portal/season-planner/add-a-race/add-a-race.component';
import { WeeklySummaryComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/weekly-summary.component';
import { DailyWorkoutComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/daily-workout.component';
import { OnboardGuard } from '../guards/onboard.guard';
import { SwimProfile1Component } from '../athlete-portal/swim-profile-1/swim-profile-1.component';
import { SwimProfile2Component } from '../athlete-portal/swim-profile-2/swim-profile-2.component';
import { RunProfileComponent } from '../athlete-portal/run-profile/run-profile.component';
import { BikeProfileComponent } from '../athlete-portal/bike-profile/bike-profile.component';
import { B2rComponent } from '../athlete-portal/user/user-profile/b2r/b2r.component';
import { SubscriptionOptionsComponent } from '../athlete-portal/user/subscription-options/subscription-options.component';
import { CheckoutComponent } from '../athlete-portal/user/subscription-options/checkout/checkout.component';
import { UserProfileComponent } from '../athlete-portal/user/user-profile/user-profile.component';
import { AthleteProfileSettingsComponent } from '../athlete-portal/user/user-profile/athlete-profile-settings/athlete-profile-settings.component';
import { AccountSettingsComponent } from '../athlete-portal/user/user-profile/account-settings/account-settings.component';
import { ChangePasswordComponent } from '../athlete-portal/user/user-profile/account-settings/change-password/change-password.component';
import { TrainingPreferencesComponent } from '../athlete-portal/user/user-profile/preferences/training-preferences/training-preferences.component';
import { NotificationPreferencesComponent } from '../athlete-portal/user/user-profile/preferences/notification-preferences/notification-preferences.component';
import { TspComponent } from '../athlete-portal/user/user-profile/tsp/tsp.component';
import { MyBikesComponent } from '../athlete-portal/user/user-profile/my-bikes/my-bikes.component';
import { DevicesComponent } from '../athlete-portal/user/devices/devices.component';
import { TrainingIntensitiesComponent } from '../athlete-portal/training-intensities/training-intensities.component';
import { AssessmentsComponent } from '../athlete-portal/assessments/assessments.component';
import { CoachesComponent } from '../athlete-portal/coaches/coaches.component';
import { ConnectDevicesComponent } from '../athlete-portal/common-components/connect-devices/connect-devices.component';
import { CoachProfileComponent } from '../athlete-portal/coaches/coach-profile/coach-profile.component';
import { SwimformComponent } from '../athlete-portal/swimform/swimform.component';
import { GraphComponent } from '../athlete-portal/graph/graph.component';
import { TermsAndConditionsComponent } from '../pages/terms-and-conditions/terms-and-conditions.component';
import { PrivacyPolicyComponent } from '../pages/privacy-policy/privacy-policy.component';
import { SearchComponent } from '../athlete-portal/search/search.component';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { SupportComponent } from '../athlete-portal/user/support/support.component';
import { SupportPageComponent } from '../pages/support-page/support-page.component';
import { PageNotFoundComponent } from '../page-not-found/page-not-found.component';
import { AppComponent } from '../app.component';
import { OnboardComponent } from '../onboard/onboard.component';
import { DashboardUserDetailsComponent } from '../athlete-portal/user-details-widget/dashboard-user-details.component';
import { DashboardRaceDetailsComponent } from '../athlete-portal/race-details-widget/dashboard-race-details.component';
import { EmailVerificationComponent } from '../athlete-portal/email-verification/email-verification.component';
import { EmailVerificationInlineComponent } from '../athlete-portal/email-verification-inline/email-verification-inline.component';
import { SessionNumbersComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/session-numbers/session-numbers.component';
import { CoachCreateSessionComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/coach-create-session/coach-create-session.component';
import { SessionNumbersCompleteComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/session-numbers-complete/session-numbers-complete.component';
import { SessionDetailsComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/session-details/session-details.component';
import { TrainxScoreComponent } from '../athlete-portal/common-components/trainx-score/trainx-score.component';
import { DownloadAppComponent } from '../athlete-portal/common-components/download-app/download-app.component';
import { InfoBlockComponent } from '../athlete-portal/common-components/info-block/info-block.component';
import { HorizontalProgressBarsComponent } from '../athlete-portal/common-components/horizontal-progress-bars/horizontal-progress-bars.component';
import { DoYourAssessmentsComponent } from '../athlete-portal/common-components/do-your-assessments/do-your-assessments.component';
import { TestDriveBannerComponent } from '../athlete-portal/common-components/test-drive-banner/test-drive-banner.component';
import { SingleWeekComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/single-week/single-week.component';
import { AddRenameSeasonComponent } from '../athlete-portal/season-planner/add-rename-season/add-rename-season.component';
import { ConfirmationModalComponent } from '../athlete-portal/common-components/confirmation-modal/confirmation-modal.component';
import { MessageModalComponent } from '../athlete-portal/common-components/message-modal/message-modal.component';
import { UpdateAppModalComponent } from '../athlete-portal/common-components/update-app-modal/update-app-modal.component';
import { SearchDetailsComponent } from '../athlete-portal/search/search-details/search-details.component';
import { MoveCopyComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/single-week/move-copy/move-copy.component';
import { UploadDataFileComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/single-week/upload-data-file/upload-data-file.component';
import { AddComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/single-week/add/add.component';
import { LinkSessionComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/single-week/link-session/link-session.component';
import { MetricsComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/metrics/metrics.component';
import { TrainingIntensitesHelpComponent } from '../athlete-portal/training-intensities/training-intensites-help/training-intensites-help.component';
import { UnlinkedFilesComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/session-list/unlinked-files/unlinked-files.component';
import { AddEntryComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/add-entry/add-entry.component';
import { AddEntryMultipleComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/add-entry-multiple/add-entry-multiple.component';
import { RaceXSidebarComponent } from '../athlete-portal/race-x/race-x-sidebar/race-x-sidebar.component';
import { RaceXEnvironmentComponent } from '../athlete-portal/race-x/race-x-environment/race-x-environment.component';
import { RaceXTimeComponent } from '../athlete-portal/race-x/race-x-time/race-x-time.component';
import { RaceXMainComponent } from '../athlete-portal/race-x/race-x-main/race-x-main.component';
import { PerformanceLevelComponent } from '../athlete-portal/user/user-profile/athlete-profile-settings/performance-level/performance-level.component';
import { PhysifactorsComponent } from '../athlete-portal/user/user-profile/athlete-profile-settings/physifactors/physifactors.component';
import { TrainingHistoryComponent } from '../athlete-portal/user/user-profile/athlete-profile-settings/training-history/training-history.component';
import { AthleteBioComponent } from '../athlete-portal/user/user-profile/athlete-profile-settings/athlete-bio/athlete-bio.component';
import { AssessmentModalComponent } from '../athlete-portal/assessments/assessment-modal/assessment-modal.component';
import { ReferCoachComponent } from '../athlete-portal/common-components/refer-coach/refer-coach.component';
import { AddTestimonialComponent } from '../athlete-portal/coaches/coach-profile/add-testimonial/add-testimonial.component';
import { ManualCompletionModalComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/session-details/manual-completion-modal/manual-completion-modal.component';
import { MyBikesLearnMoreModalComponent } from '../athlete-portal/user/user-profile/my-bikes/my-bikes-learn-more-modal/my-bikes-learn-more-modal.component';
import { CancelSubscriptionModalComponent } from '../athlete-portal/user/subscription-options/cancel-subscription-modal/cancel-subscription-modal.component';
import { SwimFormDiagnosticsComponent } from '../athlete-portal/swimform/swim-form-diagnostics/swim-form-diagnostics-modal.component';
import { PhasePreferencesComponent } from '../athlete-portal/season-planner/training-phase/phase-preferences/phase-preferences.component';
import { PaymentSettingsComponent } from '../athlete-portal/user/user-profile/payment-settings/payment-settings.component';
import { EditAccountComponent } from '../athlete-portal/user/user-profile/account-settings/edit-account/edit-account.component';
import { FiltermetricsPipe } from '../athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/metrics/filtermetrics.pipe';
import { CustomMenuComponent } from '../athlete-portal/common-components/custom-menu/custom-menu.component';
import { TimeFormatPipe } from '../athlete-portal/common-components/time-format/time-format.pipe';
import { ReplacePipe } from '../athlete-portal/common-components/replace-pipe/replace.pipe';
import { RaceXSurveyComponent } from '../athlete-portal/race-x/race-x-survey/race-x-survey.component';
import { ArticleListComponent } from '../athlete-portal/user/support/article-list/article-list.component';
import { SupportMenuComponent } from '../athlete-portal/user/support/support-menu/support-menu.component';
import { ArticleViewComponent } from '../athlete-portal/user/support/article-view/article-view.component';
import { SubmitRequestComponent } from '../athlete-portal/user/support/submit-request/submit-request.component';
import { AlertsComponent } from '../athlete-portal/common-components/alerts/alerts.component';
import { AutofocusDirective } from '../athlete-portal/common-components/autofocus/autofocus.directive';
import { BlurOnEnterDirective } from '../athlete-portal/common-components/blur-on-enter/blur-on-enter.directive';
import { PatternInputDirective } from '../athlete-portal/common-components/pattern-input/pattern-input.directive';
import { LaneLineTestHelpComponent } from '../athlete-portal/swimform/swim-form-diagnostics/lane-line-test-help/lane-line-test-help.component';
import { TicketListComponent } from '../athlete-portal/user/support/ticket-list/ticket-list.component';
import { TicketViewComponent } from '../athlete-portal/user/support/ticket-view/ticket-view.component';
import { UserPreferencesComponent } from "../athlete-portal/user/user-profile/preferences/user-preferences/user-preferences.component";

import { RaceXProfileComponent } from '../athlete-portal/race-x/race-x-profile/race-x-profile.component';
import { UpcomingRacesComponent } from '../athlete-portal/race-x/upcoming-races/upcoming-races.component';

import { WeeklyPhaseFooterComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/weekly-phase-footer/weekly-phase-footer.component';
import { PhaseDetailsComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/weekly-phase-footer/phase-details.component';
import { AddARaceFormComponent } from '../athlete-portal/season-planner/add-a-race-form/add-a-race-form.component';
import { BillingAddressComponent } from '../athlete-portal/user/user-profile/payment-settings/billing-address/billing-address.component';
import { PaymentMethodComponent } from '../athlete-portal/user/user-profile/payment-settings/payment-method/payment-method.component';
import { OverlayComponent } from '../athlete-portal/common-components/overlay/overlay.component';
import { IosDatepickerExtraDirective } from '../athlete-portal/common-components/ios-datepicker-extra/ios-datepicker-extra.directive';
import { SessionCompleteControlsComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/session-complete-controls/session-complete-controls.component';
import { SessionStatsComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/session-stats/session-stats.component';
import { SessionZonesComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/session-zones/session-zones.component';

import { HealthRelatedDataComponent } from '../athlete-portal/user/user-profile/permissions/health-related-data/health-related-data.component';
import { DailyMetricTrackingComponent } from '../athlete-portal/user/user-profile/permissions/daily-metric-tracking/daily-metric-tracking.component';

import { HealthRelatedDataSideBarComponent } from '../athlete-portal/user/user-profile/permissions/health-related-data-side-bar/health-related-data-side-bar.component';
import { SessionNotesComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/session-notes/session-notes.component';
import { SessionTimepickerComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/session-timepicker/session-timepicker.component';
import { SeasonPlannerCalendarComponent } from '../athlete-portal/season-planner/season-planner-calendar/season-planner-calendar.component';
import { SeasonPlannerCalendarMobileComponent } from '../athlete-portal/season-planner/season-planner-calendar-mobile/season-planner-calendar-mobile.component';
import { AddARaceFormMobileComponent } from '../athlete-portal/season-planner/add-a-race-form-mobile/add-a-race-form-mobile.component';
import { RaceDetailsMobileComponent } from '../athlete-portal/season-planner/race-details-mobile/race-details-mobile.component';
import { PreferencesComponent } from '../athlete-portal/user/user-profile/preferences/preferences.component';
import { MobileSessionCompleteControlsComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/mobile-session-complete-controls/mobile-session-complete-controls.component';
import { ShowOverlayDirective } from '../athlete-portal/common-components/show-overlay/show-overlay.directive';
import { ConfirmationOverlayComponent } from '../athlete-portal/common-components/confirmation-overlay/confirmation-overlay.component';
import { RestartTrialPage } from '../onboard/restart-trial/restart-trial.page';
import { BeginnerModalComponent } from '../onboard/beginner-modal/beginner-modal.component';
import { AddFirstRaceComponent } from '../athlete-portal/common-components/add-first-race/add-first-race.component';
import { WelcomeModalComponent } from '../onboard/welcome-modal/welcome-modal.component';
import { ErrorInterceptor } from '../athlete-portal/common-services/error.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoadingMobileComponent } from '../athlete-portal/common-components/loading-overlay/loading-mobile.component';
import { CancelSurveyComponent } from '../athlete-portal/user/cancel/cancel-survey.component';
import { CoachSessionNotesComponent } from '../athlete-portal/season-planner/training-phase/weekly-summary/daily-workout/coach-session-notes/coach-session-notes.component';
import { StyleGuideComponent } from '../style-guide/style-guide.component';

export const routes = [

  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dev/style-guide',
        component: StyleGuideComponent,
        data: { nosidebar: true },
      },
      {
        path: 'onboard/sign-up',
        component: SignUpComponent,
        data: { nosidebar: true },
      },
      {
        path: 'onboard/restart-trial',
        component: RestartTrialPage,
        data: { nosidebar: true },
      },
      {
        path: 'onboard/step-1',
        component: Step1Component,
        data: { nosidebar: true },
      },
      {
        path: 'onboard/step-2',
        component: Step2Component,
        data: { nosidebar: true },
      },
      {
        path: 'onboard/step-3',
        component: Step3Component,
        data: { nosidebar: true },
      },
      {
        path: 'onboard/step-4',
        component: Step4Component,
        data: { nosidebar: true },
      },
      {
        path: 'regconfirm',
        component: EmailConfirmComponent,
        data: { nosidebar: true },
      },
      {
        path: 'onboard/step-5',
        component: Step5Component,
        data: { nosidebar: true },
      },
      {
        path: 'login',
        component: LoginComponent,
        data: { nosidebar: true },
      },
      {
        path: 'coach-athlete-login',
        component: CoachAthleteLoginComponent,
        data: { nosidebar:true },
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        data: { nosidebar: true },
      },
      {
        path: 'email-sent',
        component: EmailSentComponent,
        data: { nosidebar: true },
      },
      {
        path: 'racex',
        component: RaceXComponent,
        canActivate: [OnboardGuard, SubscriptionGuard],
      },
      {
        path: 'season-planner',
        component: SeasonPlannerComponent,
        canActivate: [OnboardGuard, SubscriptionGuard],
      },
      {
        path: 'season-planner/training-phase',
        component: TrainingPhaseComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'season-planner/training-phase/add-a-race',
        component: AddARaceComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'season-planner/training-phase/weekly-summary',
        component: WeeklySummaryComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'season-planner/training-phase/weekly-summary/daily-workout',
        component: DailyWorkoutComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'swim-profile-1',
        component: SwimProfile1Component,
        data: { nosidebar: true },
      },
      {
        path: 'swim-profile-2',
        component: SwimProfile2Component,
        data: { nosidebar: true },
      },
      {
        path: 'run-profile',
        component: RunProfileComponent,
        data: { nosidebar: true },
      },
      {
        path: 'bike-profile',
        component: BikeProfileComponent,
        data: { nosidebar: true },
      },
      {
        path: 'user/user-profile/b2r',
        component: B2rComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'user/subscription-options',
        component: SubscriptionOptionsComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'user/subscription-options/checkout',
        component: CheckoutComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'user/user-profile',
        component: UserProfileComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'user/user-profile/athlete-profile-settings',
        component: AthleteProfileSettingsComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'user/user-profile/account-settings',
        component: AccountSettingsComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'user/user-profile/account-settings/change-password',
        component: ChangePasswordComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'user/user-profile/preferences',
        component: PreferencesComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'user/user-profile/tsp',
        component: TspComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'user/user-profile/my-bikes',
        component: MyBikesComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'user/devices',
        component: DevicesComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'user/devices/5',
        component: DevicesComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'user/devices/8',
        component: DevicesComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'user/cancellation-survey',
        component: CancelSurveyComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'training-intensities',
        component: TrainingIntensitiesComponent,
        canActivate: [OnboardGuard, SubscriptionGuard],
      },
      {
        path: 'assessments',
        component: AssessmentsComponent,
        canActivate: [OnboardGuard, SubscriptionGuard],
      },
      {
        path: 'coaches',
        component: CoachesComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'devices',
        component: ConnectDevicesComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'coaches/coach-profile',
        component: CoachProfileComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'swimform',
        component: SwimformComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'graph',
        component: GraphComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'pages/terms-and-conditions',
        component: TermsAndConditionsComponent
      },
      {
        path: 'pages/privacy-policy',
        component: PrivacyPolicyComponent
      },
      {
        path: 'coach/pages/terms-and-conditions',
        component: TermsAndConditionsComponent,
        data: { nosidebar: true },
      },
      {
        path: 'coach/pages/privacy-policy',
        component: PrivacyPolicyComponent,
        data: { nosidebar: true },
      },
      {
        path: 'search',
        component: SearchComponent,
        canActivate: [AuthenticationGuard, OnboardGuard]
      },
      {
        path: 'support',
        component: SupportComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'support/:articleId',
        component: SupportComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'user/user-profile/permissions/health-related-data',
        component: HealthRelatedDataComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'user/user-profile/permissions/daily-metric-tracking',
        component: DailyMetricTrackingComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'user/user-profile/permissions/health-related-data-side-bar',
        component: HealthRelatedDataSideBarComponent,
        canActivate: [OnboardGuard],
      },
      {
        path: 'contactus',
        component: SupportPageComponent
      },
      {
        path: 'genetics',
        loadChildren: 'app/routes/genetics/genetics.module#GeneticsModule',
        canActivate: [OnboardGuard],
      },
      { path: 'sign-in', pathMatch: 'full', redirectTo: 'login' },
      { path: 'sign-up', pathMatch: 'full', redirectTo: 'onboard/sign-up' },
      { path: '', pathMatch: 'full', redirectTo: 'season-planner/training-phase/weekly-summary/daily-workout' },
      { path: 'dashboard', pathMatch: 'full', redirectTo: 'season-planner/training-phase/weekly-summary/daily-workout' },
      {
        path: 'coach',
        loadChildren: 'app/routes/coach/coach.module#CoachModule',
      },
      { path: '**', pathMatch: 'full', component: PageNotFoundComponent, data: { nosidebar: true }, }
    ]
  },

  { path: '**', redirectTo: 'login' }

];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ],
  declarations: [
    StyleGuideComponent,
    HealthRelatedDataComponent,
    HealthRelatedDataSideBarComponent,
    DailyMetricTrackingComponent,
    AppComponent,
    OnboardComponent,
    SignUpComponent,
    RestartTrialPage,
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component,
    Step5Component,
    LoginComponent,
    CoachAthleteLoginComponent,
    ForgotPasswordComponent,
    EmailSentComponent,
    DashboardUserDetailsComponent,
    DashboardRaceDetailsComponent,
    SwimProfile1Component,
    SwimProfile2Component,
    BikeProfileComponent,
    RunProfileComponent,
    EmailVerificationComponent,
    EmailVerificationInlineComponent,
    SearchComponent,
    SeasonPlannerComponent,
    TrainingPhaseComponent,
    WeeklySummaryComponent,
    DailyWorkoutComponent,
    SessionNumbersComponent,
    CoachCreateSessionComponent,
    SessionNumbersCompleteComponent,
    SessionDetailsComponent,
    TrainxScoreComponent,
    AddFirstRaceComponent,
    ConnectDevicesComponent,
    DownloadAppComponent,
    InfoBlockComponent,
    HorizontalProgressBarsComponent,
    DoYourAssessmentsComponent,
    TestDriveBannerComponent,
    SingleWeekComponent,
    WeeklyPhaseFooterComponent,
    PhaseDetailsComponent,
    AddARaceComponent,
    AddARaceFormComponent,
    PageNotFoundComponent,
    AddRenameSeasonComponent,
    ConfirmationModalComponent,
    MessageModalComponent,
    UpdateAppModalComponent,
    SearchDetailsComponent,
    MoveCopyComponent,
    UploadDataFileComponent,
    AddComponent,
    LinkSessionComponent,
    RaceXComponent,
    RaceXProfileComponent,
    MetricsComponent,
    TrainingIntensitesHelpComponent,
    UnlinkedFilesComponent,
    AddEntryComponent,
    AddEntryMultipleComponent,
    RaceXSidebarComponent,
    RaceXEnvironmentComponent,
    RaceXTimeComponent,
    RaceXMainComponent,
    UserProfileComponent,
    AthleteProfileSettingsComponent,
    PerformanceLevelComponent,
    PhysifactorsComponent,
    TrainingHistoryComponent,
    AthleteBioComponent,
    PreferencesComponent,
    UserPreferencesComponent,
    TrainingPreferencesComponent,
    TrainingIntensitiesComponent,
    AssessmentsComponent,
    AssessmentModalComponent,
    SwimformComponent,
    CoachesComponent,
    CoachProfileComponent,
    PrivacyPolicyComponent,
    TermsAndConditionsComponent,
    EmailConfirmComponent,
    SubscriptionOptionsComponent,
    DevicesComponent,
    CancelSurveyComponent,
    GraphComponent,
    ReferCoachComponent,
    NotificationPreferencesComponent,
    MyBikesComponent,
    B2rComponent,
    TspComponent,
    AddTestimonialComponent,
    ManualCompletionModalComponent,
    MyBikesLearnMoreModalComponent,
    CancelSubscriptionModalComponent,
    SwimFormDiagnosticsComponent,
    PhasePreferencesComponent,
    AccountSettingsComponent,
    PaymentSettingsComponent,
    BillingAddressComponent,
    PaymentMethodComponent,
    CheckoutComponent,
    ChangePasswordComponent,
    EditAccountComponent,
    FiltermetricsPipe,
    SupportComponent,
    CustomMenuComponent,
    TimeFormatPipe,
    ReplacePipe,
    RaceXSurveyComponent,
    ArticleListComponent,
    SupportMenuComponent,
    ArticleViewComponent,
    SupportPageComponent,
    SubmitRequestComponent,
    AlertsComponent,
    AutofocusDirective,
    BlurOnEnterDirective,
    PatternInputDirective,
    LaneLineTestHelpComponent,
    TicketListComponent,
    TicketViewComponent,
    RaceXProfileComponent,
    UpcomingRacesComponent,
    OverlayComponent,
    IosDatepickerExtraDirective,
    SessionCompleteControlsComponent,
    MobileSessionCompleteControlsComponent,
    SessionStatsComponent,
    SessionZonesComponent,
    SessionNotesComponent,
    CoachSessionNotesComponent,
    LoadingMobileComponent,
    SessionTimepickerComponent,
    SeasonPlannerCalendarComponent,
    SeasonPlannerCalendarMobileComponent,
    AddARaceFormMobileComponent,
    RaceDetailsMobileComponent,
    ShowOverlayDirective,
    ConfirmationOverlayComponent,
    BeginnerModalComponent,
    WelcomeModalComponent,
  ],
  exports: [
    RouterModule,
  ]
})
export class RoutesModule { }
