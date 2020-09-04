import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { CoachProfileComponent } from '../../coach-portal/profile/coach-profile.component';
import { CoachAthletesComponent } from '../../coach-portal/athletes/coach-athletes.component';
import { CoachSubscriptionOptionsComponent } from '../../coach-portal/coach-subscriptions-options/coach-subscription-options.component';
import { CoachCheckoutComponent } from '../../coach-portal/coach-checkout/coach-checkout.component';

const routes: Routes = [
    {
        path: 'coachProfile',
        component: CoachProfileComponent,
    },
    {
        path: '',
        component: CoachAthletesComponent,
    },
    {
        path: 'coachAthletes',
        component: CoachAthletesComponent,
    },
    {
        path: 'subscription-options',
        component: CoachSubscriptionOptionsComponent,
    },
    {
        path: 'subscription-options/checkout',
        component: CoachCheckoutComponent,
    },
];

export const CoachRoutes: ModuleWithProviders = RouterModule.forChild(routes);