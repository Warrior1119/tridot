import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { DOCUMENT, } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';
import { DashboardServiceService } from '../../../athlete-portal/common-services/dashboard-service.service';
import { AlertComponent } from 'ngx-bootstrap/alert/alert.component';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-search-details',
  templateUrl: './search-details.component.html',
  styleUrls: ['./search-details.component.scss']
})
export class SearchDetailsComponent implements OnInit {
  @Input() displayModal;
  @Input() item;
  comments;
  alerts: any[] = [];
  constructor(
    private dashboardService: DashboardServiceService, 
    @Inject(DOCUMENT) private document: Document, 
    private santizer: DomSanitizer,
    private toastr: ToastrService, 
  ) { }

  closeModal() {
    this.displayModal.hide();
  }

  formatDescription(str) {
    var d = document.createElement('div');
    d.innerHTML = str;
    return d.textContent.replace('READ MORE', '');
  }

  formatHTML(article) {
    var d = document.createElement('div');
    d.innerHTML = article;
    return d.innerHTML;
  }

  send(id, comment) {
    this.dashboardService.submitcomment(id, comment).subscribe((res) => {
      console.log(res);

      if (res.header.status === 'success') {
        this.toastr.success(res.body.response.confirmationMessage);
      } else if (res.header.status === 'error') {
        this.toastr.error(res.body.response.msg);
      }
    }, (err) => {
      this.toastr.error('Something went wrong. Please try again later.');
    });
  }

  ngOnInit() {
  }

}
