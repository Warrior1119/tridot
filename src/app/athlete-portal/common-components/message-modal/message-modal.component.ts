import { Component, Input, Output, EventEmitter, Injectable } from '@angular/core';

@Component({
  selector: 'app-message-modal',
  templateUrl: './message-modal.component.html',
  styleUrls: ['./message-modal.component.scss']
})

export class MessageModalComponent {
  @Input() displayModal;
  @Input() message: string;
  @Input() alert: string;
  @Input() modalType: string;
  @Input() successBtnTxt: string;
  @Input() successBtnClass: string;
  @Input() modalTitle: string;
  @Input() imageUrl: string;
  @Input() btnSuccAndErrorStyle: string;
  @Input() btnSuccAndErrorText: string;

  @Output() confirmation = new EventEmitter();

  setModalMessageTitleAndImage(status) {
    if (status.toLowerCase() === "success") {
      this.modalTitle = "Success";
      this.imageUrl = "../../../../assets/img/svg/success-icon.svg";
      this.btnSuccAndErrorStyle = "btn btn-lg btn-block text-md btn-success";
      this.btnSuccAndErrorText = "OK";
      return true;
    } else if (status.toLowerCase() === "error") {
      this.modalTitle = "Error";
      this.imageUrl = "../../../../assets/img/svg/error-icon.svg";
      this.btnSuccAndErrorStyle = "btn btn-lg btn-block btn-danger";
      this.btnSuccAndErrorText = "DISMISS";
      return false;
    } else {
      this.imageUrl = "../../../../assets/img/svg/error-icon.svg";
      this.modalTitle = "Error Message";
      this.btnSuccAndErrorStyle = "btn btn-lg btn-block text-md btn-danger";
      this.btnSuccAndErrorText = "DISMISS";
      return false;
    }
  }
  showException(err) {
    this.imageUrl = "../../../../assets/img/svg/error-icon.svg";
    this.modalTitle = "Unexpected Error Message";
    this.btnSuccAndErrorStyle = "btn btn-lg btn-block text-md btn-danger";
    this.btnSuccAndErrorText = "DISMISS";
    this.message = err.message;
  }
  parseAndSetBackendResponse(res) {
    if (res && res.body && res.body.response && res.body.response.msg) {
      this.message = res.body.response.msg;
      return this.setModalMessageTitleAndImage(res.header.status);
    } else {
      this.message = "Some Error In Adding Device";
      return this.setModalMessageTitleAndImage(null);
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
