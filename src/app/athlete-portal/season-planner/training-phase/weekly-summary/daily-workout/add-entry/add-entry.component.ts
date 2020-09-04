import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-add-entry',
  templateUrl: './add-entry.component.html',
  styleUrls: ['./add-entry.component.scss']
})
export class AddEntryComponent {
  @Input() metric;
  @Output() selected = new EventEmitter();
  @Input() displayModal;

  constructor() { }

  closeModal() {
    this.displayModal.hide();
  }

  save(result) {
    this.selected.next(result);
    this.closeModal();
  }

}
