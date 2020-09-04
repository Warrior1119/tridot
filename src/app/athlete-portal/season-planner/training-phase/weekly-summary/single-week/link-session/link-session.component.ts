import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-link-session',
  templateUrl: './link-session.component.html',
  styleUrls: ['./link-session.component.scss']
})
export class LinkSessionComponent implements OnInit {
  @Input() displayModal;
  @Input() files;
  @Output() session = new EventEmitter();
  constructor() { }
  selectedSession;

  closeModal() {
    this.displayModal.hide();
  }

  convertToHHMM(seconds) {
    var date = new Date(null);
    date.setSeconds(parseInt(seconds)); // specify value for SECONDS here
    return date.toISOString().substr(11, 5);
  }

  getSession(session) {
    this.session.next(session);
    this.closeModal();
  }


  ngOnInit() {
  }

}
