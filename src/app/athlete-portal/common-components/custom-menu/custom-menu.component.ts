import { Component, Input, ElementRef, ViewChild } from "@angular/core";
import { BsDropdownDirective } from "ngx-bootstrap/dropdown";

@Component({
    selector: 'custom-menu',
    templateUrl: './custom-menu.component.html',
    styleUrls: ['./custom-menu.component.scss'],
})
export class CustomMenuComponent {
    @Input() iconName = 'burger-icon';
    @Input() menuClass = '';
    @Input() buttonClass = '';
    @Input() isMobileOrTablet;

    @ViewChild('icon') icon: ElementRef;
    @ViewChild('dropdown') dropdown: BsDropdownDirective;

    resources = {};

    get isOpen() {
        return this.dropdown.isOpen;
    }

    onOpenChange(e: boolean) {
        this._propagateClickToSvg();
    }

    toggle(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = this.dropdown.isOpen;
        this._propagateClickToDocument();
        if (isOpen) {
            this.dropdown.hide();
        } else {
            this.dropdown.show();
        }
    }

    hide(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        this._propagateClickToDocument();
        this.dropdown.toggle(false);
    }

    private _propagateClickToSvg() {
        const svg = this.icon.nativeElement.querySelector('svg');
        svg.dispatchEvent(new Event('click'));
    }

    private _propagateClickToDocument() {
        // Get autoClose feature working with $event.stopPropagation()
        window.document.dispatchEvent(new Event('click'));
    }
}
