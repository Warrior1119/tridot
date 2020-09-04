import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-lane-line-test-help',
  templateUrl: './lane-line-test-help.component.html',
  styleUrls: ['./lane-line-test-help.component.scss']
})
export class LaneLineTestHelpComponent implements OnInit {

  @Input() displayModal;

  constructor() { }

  ngOnInit() {
  }

  closeModal() {
    this.displayModal.hide();
  }
}
