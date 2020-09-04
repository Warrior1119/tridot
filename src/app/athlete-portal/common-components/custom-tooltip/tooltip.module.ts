import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomTooltipDirective } from './tooltip.directive'; 
import { CustomTooltipComponent } from './tooltip.component';

@NgModule({
    declarations: [
        CustomTooltipDirective,
        CustomTooltipComponent,
    ],
    imports: [
        CommonModule,
    ],
    exports: [
        CustomTooltipDirective,
    ],
    entryComponents: [
        CustomTooltipComponent,
    ]
})
export class CustomTooltipModule { }