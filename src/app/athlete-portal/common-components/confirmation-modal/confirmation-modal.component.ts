import { Component, Input, Output, EventEmitter } from '@angular/core';

export type ModalType = 'warning' | 'error' | 'success' | 'loading' | 'info';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent {
  @Input() displayModal;
  @Input() message: string;
  @Input() alert: string;
  @Input() modalType: ModalType = 'warning';
  @Input() successBtnTxt: string;
  @Input() successBtnClass: string;
  @Input() modalTitle: string;
  @Input() cancelBtnEnabled: boolean = false;

  @Output() confirmation = new EventEmitter();

  get btnClass() {
    if (this.successBtnClass) {
      return this.successBtnClass;
    }
    switch (this.modalType) {
      case 'warning': return 'btn-warning';
      case 'error': return 'btn-danger';
      case 'success': return 'btn-success';
      case 'loading': return 'btn-default';
      case 'info': return 'btn-success';
    }
  }

  decision(confirm) {
    this.confirmation.next(confirm);
    this.closeModal();
  }

  closeModal() {
    this.displayModal.hide();
  }

}
