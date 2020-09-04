import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-add-testimonial',
  templateUrl: './add-testimonial.component.html',
  styleUrls: ['./add-testimonial.component.scss']
})
export class AddTestimonialComponent implements OnInit {
  @Input() displayModal;
  @Output() testimonial = new EventEmitter();
  message: String;
  constructor() { }

  save(message) {
    this.testimonial.next(message);
    this.closeModal();
  }

  closeModal() {
    this.displayModal.hide();
  }

  ngOnInit() {
  }

}
