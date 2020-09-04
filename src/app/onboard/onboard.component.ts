import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-onboard',
  templateUrl: './onboard.component.html',
  styleUrls: ['./onboard.component.scss']
})
export class OnboardComponent implements OnInit {

  @HostListener('window:beforeunload', ['$event']) onBeforeUnload($event) {
    return $event.returnValue = false;
  }

  constructor() { }

  ngOnInit() {
  }

}
