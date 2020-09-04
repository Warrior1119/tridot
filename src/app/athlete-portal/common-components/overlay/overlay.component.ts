import { Component, Input } from "@angular/core";

@Component({
    selector: 'overlay',
    templateUrl: './overlay.component.html',
    styleUrls: ['./overlay.component.scss'],
})
export class OverlayComponent {

    @Input() visible = true;
    @Input() color: string;
    @Input() opacity: number;

}