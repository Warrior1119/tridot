import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-session-timepicker',
  templateUrl: './session-timepicker.component.html',
  styleUrls: ['./session-timepicker.component.scss']
})
export class SessionTimepickerComponent {
  @Input() displayModal;
  @Input() time;
  @Output() updateTime = new EventEmitter();

  constructor() { }

}
