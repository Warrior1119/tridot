import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Animations } from '../../../constants/animations';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cancel-subscription-modal',
  templateUrl: './cancel-subscription-modal.component.html',
  styleUrls: ['./cancel-subscription-modal.component.scss'],
  animations: [ Animations.NgIf.ngIfFadeIn ],
  encapsulation: ViewEncapsulation.None,
})
export class CancelSubscriptionModalComponent {
  
  @Input() displayModal;

  constructor(private router: Router) {}

  closeModal() {
    this.displayModal.hide();
  }

  goToOffboardingSurvey() {
    this.closeModal();
    this.router.navigate(['/user/cancellation-survey']);
  }

}
