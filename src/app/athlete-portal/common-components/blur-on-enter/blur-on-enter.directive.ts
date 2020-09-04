import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
    selector: 'input[blurOnEnter]',
})
export class BlurOnEnterDirective {

    constructor(
        private element: ElementRef,
    ) {}

    @HostListener('keypress', ['$event'])
    onKey($event: KeyboardEvent) {
        if ($event.keyCode === 13) {
            this.element.nativeElement.blur();
            $event.preventDefault();
            $event.stopPropagation();
        }
    }
    
}
