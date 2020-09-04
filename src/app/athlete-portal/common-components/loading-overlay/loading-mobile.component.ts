import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-mobile',
  templateUrl: './loading-mobile.component.html',
  styleUrls: ['./loading-mobile.component.scss'],
})
export class LoadingMobileComponent {
  @Input() small: boolean;
  @Input() loadingText: string;
}
