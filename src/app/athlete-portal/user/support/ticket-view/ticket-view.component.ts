import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SupportService } from "../support.service";
import { Router } from "@angular/router";
import {TextEncodeDecode} from "../../../common-model/textEncodeDecode.modal";

@Component({
  selector: 'app-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.scss']
})
export class TicketViewComponent implements OnInit {



  @Input() ticket;
  @Output() back = new EventEmitter();

  ticketComments = [];
  loading = false;
  additionalComment = "";

  constructor(private supportService: SupportService, private router: Router,
    private textEncodeDecode:TextEncodeDecode) { }

  ngOnInit() {
    this.getTicketComments();
  }

  async getTicketComments() {
    try {
      this.loading = true;
      this.ticketComments = await this.supportService.getTicketComments(this.ticket.id);
      this.loading = false;
    } catch (err) {
      this.loading = false;
      console.error(err);
    }
  }

  backToList() {
    this.back.emit();
  }

  async save() {
    
   let res= await this.supportService.submitTicketComment(this.ticket.id,this.textEncodeDecode.getEncodedText(this.additionalComment));
    this.ticketComments = await this.supportService.getTicketComments(this.ticket.id);
    this.additionalComment = "";
  }
}
