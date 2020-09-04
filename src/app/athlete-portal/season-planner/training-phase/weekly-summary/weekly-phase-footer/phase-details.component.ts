import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-phase-details',
    templateUrl: './phase-details.component.html',
})
export class PhaseDetailsComponent {

  @Input() prefix: string;
  @Input() duration: string;
  @Input() phaseStart: string;
  @Input() phaseEnd: string;
  @Input() phaseType: 'devel'|'custom'|'racex';

}
