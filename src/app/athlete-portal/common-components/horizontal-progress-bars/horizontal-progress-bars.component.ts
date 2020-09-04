import { Component, Input } from '@angular/core';
import { ProgressItem } from './progress-item.model';

@Component({
  selector: 'app-horizontal-progress-bars',
  templateUrl: './horizontal-progress-bars.component.html',
})
export class HorizontalProgressBarsComponent {
  @Input() public progressItems: ProgressItem[];
  @Input() public progressTitle: string;
  @Input() public progressDefColor: string;
}
