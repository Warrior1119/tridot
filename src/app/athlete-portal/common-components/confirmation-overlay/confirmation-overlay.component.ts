import { Component, AfterViewInit, ElementRef } from '@angular/core';

@Component({
  selector: 'confirmation-overlay',
  templateUrl: './confirmation-overlay.component.html',
  styleUrls: ['./confirmation-overlay.component.scss']
})
export class ConfirmationOverlayComponent implements AfterViewInit {

  constructor(private element: ElementRef) { }

  ngAfterViewInit() {
    this.element.nativeElement.parentElement.style.position = 'relative';
  }

}
