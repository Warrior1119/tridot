import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';

import { GaugeChartSvgComponent } from './gauge-chart-svg/gauge-chart-svg.component';
import { GeneticsHeaderComponent } from './genetics-header/genetics-header.component';
import { GeneticsListComponent } from './genetics-list/genetics-list.component';
import { GeneticsGlossaryComponent } from './genetics-glossary/genetics-glossary.component';

const COMPONENTS = [
    GaugeChartSvgComponent,
    GeneticsHeaderComponent,
    GeneticsListComponent,
    GeneticsGlossaryComponent,
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        SharedModule,
    ],
    declarations: COMPONENTS,
    exports: [
        ...COMPONENTS,
    ]
})
export class GeneticsComponentsModule {}