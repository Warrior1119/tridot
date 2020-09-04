import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Animations } from '../../../../constants/animations';

@Component({
    selector: 'app-weekly-phase-footer',
    templateUrl: './weekly-phase-footer.component.html',
    animations: [ Animations.ExpandCollapse.expandWidth ],
})
export class WeeklyPhaseFooterComponent {

  @Input() mode: 'past'|'current'|'future' = 'current';
  @Input() duration: string;
  @Input() phaseStart: string;
  @Input() phaseEnd: string;
  @Input() phaseType: 'devel'|'custom'|'racex';
  @Input() raceType: string;
  @Input() phasePrior;
  @Input() phaseNext;
  @Output() current = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  states = {} as any;

  getPhaseClass(phaseType: string) {
    if (!phaseType) {
      return '';
    }
    if (phaseType.toLowerCase() === 'devel') {
      return 'dev-phase';
    }
    if (
      phaseType.toLowerCase() === 'custom' ||
      phaseType.toLowerCase() === 'racex'
    ) {
      return 'prep-phase';
    }
  }

}
