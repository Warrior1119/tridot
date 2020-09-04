import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-performance-level',
  templateUrl: './performance-level.component.html',
  styleUrls: ['./performance-level.component.scss']
})
export class PerformanceLevelComponent {
  @Input() profile;
  @Output() save = new EventEmitter();

  update(profile) {
    this.save.next(profile);
  }
}
