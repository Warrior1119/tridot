import { NgModule } from '@angular/core';
import { TimeFormatMaskDirective } from './time-format-mask.directive';

@NgModule({
    declarations: [
        TimeFormatMaskDirective,
    ],
    exports: [
        TimeFormatMaskDirective,
    ],
})
export class TimeFormatMaskModule { }
