import { OnInit, ElementRef, Directive } from '@angular/core';

@Directive({
    selector: 'input[autofocus],textarea[autofocus]',
})
export class AutofocusDirective implements OnInit {

    constructor(
        private element: ElementRef,
    ) {}

    ngOnInit() {
        this.element.nativeElement.focus();
    }
}
