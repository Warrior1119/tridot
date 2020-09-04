import { Component } from '@angular/core';

@Component({
  selector: 'app-step-5',
  templateUrl: './step-5.component.html',
  styleUrls: ['./step-5.component.scss']
})
export class Step5Component {
  public loading = false;
  public next(): void {
    this.loading = true;
    setTimeout(() => {
      window.location.href = window.location.origin + '/swim-profile-1';
    }, 2000);
  }
}
