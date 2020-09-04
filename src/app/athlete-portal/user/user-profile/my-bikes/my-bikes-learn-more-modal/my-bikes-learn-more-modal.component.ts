import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Animations } from '../../../../constants/animations';

@Component({
  selector: 'app-my-bikes-learn-more-modal',
  templateUrl: './my-bikes-learn-more-modal.component.html',
  styleUrls: ['./my-bikes-learn-more-modal.component.scss'],
  animations: [ Animations.NgIf.ngIfFadeIn ],
  encapsulation: ViewEncapsulation.None,
})
export class MyBikesLearnMoreModalComponent {
  
  @Input() displayModal;

  closeModal() {
    this.displayModal.hide();
  }

}
