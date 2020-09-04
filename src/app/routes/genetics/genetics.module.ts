import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { GeneticsRoutes } from './genetics.routing';

import { GeneticsNavigatorPage } from './navigator.page';
import { GeneticsDashboardPage } from './dashboard.page';
import { GeneticsConnectPage } from './connect.page';
import { GeneticsComponentsModule } from './components/genetics-components.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../../athlete-portal/common-services/auth.interceptor';

const COMPONENTS = [
    GeneticsNavigatorPage,
    GeneticsDashboardPage,
    GeneticsConnectPage,
];

@NgModule({
    imports: [
        SharedModule,
        GeneticsRoutes,
        GeneticsComponentsModule,
    ],
    declarations: COMPONENTS,
    providers: [
      { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    ],
    exports: COMPONENTS,
})
export class GeneticsModule { }
