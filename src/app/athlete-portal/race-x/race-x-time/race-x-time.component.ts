import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-race-x-time',
  templateUrl: './race-x-time.component.html',
  styleUrls: ['./race-x-time.component.scss']
})
export class RaceXTimeComponent {
  @Input() race;
  @Input() details;
}