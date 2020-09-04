import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { ChartsModule } from 'ng2-charts';
import { SocialLoginModule } from 'angularx-social-login';
import { AutoSizeInputModule } from 'ngx-autosize-input';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgPipesModule } from 'ngx-pipes';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { TridotUiSharedModule } from "@predictivefitness/tridot-ui-shared";
import { environment } from "../../environments/environment";
import { InlineSVGModule } from '../athlete-portal/common-components/inline-svg/inline-svg.module';
import { MomentModule } from 'ngx-moment';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxGeoautocompleteModule } from 'ngx-geoautocomplete';
import { AlertModule } from 'ngx-bootstrap/alert';
import { NgxPaginationModule } from 'ngx-pagination';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import {NgxWebstorageModule} from 'ngx-webstorage';
import { DragulaModule } from 'ng2-dragula';
import { AgmCoreModule } from '@agm/core';
import { CustomTooltipModule } from '../athlete-portal/common-components/custom-tooltip/tooltip.module';
import { TimeFormatMaskModule } from '../athlete-portal/common-components/time-format-mask/time-format-mask.module';
import { DismissableComponent } from '../athlete-portal/common-components/dismissable/dismissable.component';
import { IsFeatureSubscribedDirective } from '../athlete-portal/common-components/is-feature-subscribed/is-feature-subscribed.directive';
import { UnlockOverlayComponent } from '../athlete-portal/common-components/unlock-overlay/unlock-overlay.component';
import { LoadingOverlayComponent } from '../athlete-portal/common-components/loading-overlay/loading-overlay.component';
import { FooterComponent } from '../athlete-portal/footer/footer.component';
import { InstallPopupComponent } from '../athlete-portal/footer/install-popup/install-popup.component';
import { ChartWrapperComponent } from '../athlete-portal/common-components/chart-wrapper/chart-wrapper.component';
import { MenusComponent } from '../athlete-portal/user/user-profile/menus/menus.component';
import { WorkoutExportPreferenceComponent } from '../athlete-portal/user/user-profile/preferences/notification-preferences/workout-export-preferences/workout-export-preferences.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    ChartsModule,
    NgxMaskModule.forRoot(),
    InlineSVGModule.forRoot(),
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgxGeoautocompleteModule.forRoot(),
    AlertModule.forRoot(),
    BsDropdownModule.forRoot(),
    TimepickerModule.forRoot(),
    ButtonsModule.forRoot(),
    ProgressbarModule.forRoot(),
    TypeaheadModule.forRoot(),
    TooltipModule.forRoot(),
    NgxWebstorageModule.forRoot({ prefix: 'tridot', separator: '.' }),
    DragulaModule.forRoot(),
    AgmCoreModule.forRoot({ apiKey: 'AIzaSyCFTbqXr8s180LScSBkU3kQxFDavmucjTw' }),
    TridotUiSharedModule.forRoot({
      baseApiUrl: environment.API_ENDPOINT,
    }),
  ],
  declarations: [
    DismissableComponent,
    IsFeatureSubscribedDirective,
    UnlockOverlayComponent,
    LoadingOverlayComponent,
    FooterComponent,
    InstallPopupComponent,
    ChartWrapperComponent,
    MenusComponent,
    WorkoutExportPreferenceComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    NgxMaskModule,
    ChartsModule,
    SocialLoginModule,
    AutoSizeInputModule,
    PerfectScrollbarModule,
    NgPipesModule,
    AngularSvgIconModule,
    InlineSVGModule,
    MomentModule,
    ModalModule,
    BsDatepickerModule,
    NgxGeoautocompleteModule,
    AlertModule,
    NgxPaginationModule,
    BsDropdownModule,
    TimepickerModule,
    ButtonsModule,
    ProgressbarModule,
    TypeaheadModule,
    NgxChartsModule,
    TooltipModule,
    NgxWebstorageModule,
    DragulaModule,
    CustomTooltipModule,
    TimeFormatMaskModule,
    AgmCoreModule,
    DismissableComponent,
    IsFeatureSubscribedDirective,
    UnlockOverlayComponent,
    LoadingOverlayComponent,
    FooterComponent,
    InstallPopupComponent,
    ChartWrapperComponent,
    TridotUiSharedModule,
    MenusComponent,
    WorkoutExportPreferenceComponent
  ],
  providers: [
    DecimalPipe
  ]
})

export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule
    };
  }
}

