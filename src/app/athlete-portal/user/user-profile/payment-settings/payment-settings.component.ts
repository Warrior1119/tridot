import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-payment-settings',
  templateUrl: './payment-settings.component.html',
  styleUrls: ['./payment-settings.component.scss']
})
export class PaymentSettingsComponent {
  
  @Input() subscription = {billingAddress: {}, creditCardData: {}} as any;
  @Input() isMobile;
  @Output() subscriptionChange = new EventEmitter();

}
