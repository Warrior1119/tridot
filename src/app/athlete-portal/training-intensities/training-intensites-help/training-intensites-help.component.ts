import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-training-intensites-help',
  templateUrl: './training-intensites-help.component.html',
  styleUrls: ['./training-intensites-help.component.scss']
})
export class TrainingIntensitesHelpComponent implements OnInit {

  @Input() displayModal;

  constructor() { }

  ngOnInit() {
  }

  closeModal() {
    this.displayModal.hide();
  }
}
