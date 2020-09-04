import { Component, OnInit, Output, EventEmitter  } from '@angular/core';
import { Router } from "@angular/router";
import { SupportService } from "../support.service";
import {TextEncodeDecode} from "../../../common-model/textEncodeDecode.modal";

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss']
})
export class TicketListComponent implements OnInit {


  @Output() back = new EventEmitter();

  pageNumber;
  ticketList = [];
  loading;

  constructor(private supportService: SupportService, private router: Router,
    private textEncodeDecode:TextEncodeDecode,) { }

  ngOnInit() {
    this.getSupportTickets();
  }

  backToHome() {
    this.back.emit({ index: -1 });
  }

  async getSupportTickets() {
    try {
      this.loading = true;
      this.ticketList = await this.supportService.supportTickets();
      this.loading = false;
    } catch (err) {
      this.loading = false;
      console.error(err);
    }
  }

}
