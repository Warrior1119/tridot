import { Component, Input, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-download-app',
  templateUrl: './download-app.component.html',
  styleUrls: ['./download-app.component.scss']
})
export class DownloadAppComponent {
  @Input() profile;
  modalRef;

  constructor(private modalService: BsModalService) { }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
}
