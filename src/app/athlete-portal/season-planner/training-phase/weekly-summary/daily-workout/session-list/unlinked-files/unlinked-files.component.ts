import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-unlinked-files',
  templateUrl: './unlinked-files.component.html',
  styleUrls: ['./unlinked-files.component.scss']
})
export class UnlinkedFilesComponent implements OnInit {
  @Input() displayModal;
  @Input() files;
  @Output() decision = new EventEmitter();

  constructor() { }

  closeModal() {
    this.displayModal.hide();
  }

  reply(file, action) {
    this.decision.next({
      file: file,
      action: action
    });

    this.displayModal.hide();
  }

  ngOnInit() {
  }

}
