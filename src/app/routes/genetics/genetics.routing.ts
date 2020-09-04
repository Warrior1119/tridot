import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { GeneticsNavigatorPage } from './navigator.page';
import { GeneticsDashboardPage } from './dashboard.page';
import { GeneticsConnectPage } from './connect.page';

const routes: Routes = [
    {
        path: '',
        component: GeneticsDashboardPage,
    },
    {
      path: 'navigator',
      component: GeneticsNavigatorPage,
    },
    {
        path: 'connect',
        component: GeneticsConnectPage,
    }
];

export const GeneticsRoutes: ModuleWithProviders = RouterModule.forChild(routes);
