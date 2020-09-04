import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from "@angular/router";
import { SupportService } from "../support.service";
import { ToastrService } from 'ngx-toastr';
import {TextEncodeDecode} from '../../../common-model/textEncodeDecode.modal';
import { ConfirmationModalComponent } from '../../../common-components/confirmation-modal/confirmation-modal.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';


@Component({
  selector: 'app-submit-request',
  templateUrl: './submit-request.component.html',
  styleUrls: ['./submit-request.component.scss']
})
export class SubmitRequestComponent implements OnInit {

  @Input() displayModal;
  data = { subject: "", description: "" };
  alerts = [];
  @Output() ticketId = new EventEmitter();
  modalRef: BsModalRef;
  constructor(
    private supportService: SupportService,
    private router: Router,
    private toastr: ToastrService,
    private textEncodeDecode:TextEncodeDecode,
    private modalService: BsModalService,
  ) { }

  ngOnInit() {
  }


  closeModal() {
    this.displayModal.hide();
  }

  async save() {
    try {
      this.closeModal(); 
      this.data.description=this.textEncodeDecode.getEncodedText(this.data.description)
      let ticketId = await this.supportService.submitTicket(this.data);
      this.ticketId.next(ticketId);
      this.modalRef = this.modalService.show(ConfirmationModalComponent);
      this.modalRef.content.message = 'Request submitted!';
      this.modalRef.content.displayModal = this.modalRef;
      this.modalRef.content.modalType = 'success';
      this.modalRef.content.confirmation.subscribe((decision) => {
       
      });
    
      
          //this.closeModal();
    } catch (err) {
      console.error(err);
    }
  }

}
