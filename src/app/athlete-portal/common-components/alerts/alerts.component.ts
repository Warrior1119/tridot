import { Component, Input } from '@angular/core';
import { Alert } from './alert.model';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
})
export class AlertsComponent {
  @Input() alerts: Alert[];
}
