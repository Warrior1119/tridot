import { Directive } from '@angular/core';
import { BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
import { isMobileSafari } from '../../../utils/browser';

@Directive({
    selector: '[iosDatepickerExtra]',
    exportAs: 'iosDatepickerExtra',
})
export class IosDatepickerExtraDirective {

    constructor(
        private _picker: BsDatepickerDirective,
    ) {}

    onShowPicker(event) {
        const dayHoverHandler = event.dayHoverHandler;
        const hoverWrapper = (hoverEvent) => {
            const { cell, isHovered } = hoverEvent;
    
            if (isHovered && isMobileSafari() && 'ontouchstart' in window) {
                (this._picker as any)._datepickerRef.instance.daySelectHandler(cell);
            }
    
            return dayHoverHandler(hoverEvent);
        };
        event.dayHoverHandler = hoverWrapper;
    }
    
}
