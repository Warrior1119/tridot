import { Component, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { isiOSApp } from "../../../utils/browser";

@Component({
  selector: 'app-unlock-overlay',
  templateUrl: './unlock-overlay.component.html',
  styleUrls: ['./unlock-overlay.component.scss']
})
export class UnlockOverlayComponent implements AfterViewInit {

  @Input() height: number;

  get isiOSApp() {
    return isiOSApp();
  }

  constructor(
    private router: Router,
    private element: ElementRef,
  ) {}

  ngAfterViewInit() {
    this.element.nativeElement.parentElement.style.position = 'relative';
  }

  upgrade() {
    this.router.navigate(['/user/subscription-options']);
  }

}
