
import {fromEvent as observableFromEvent,  Observable } from 'rxjs';

import {map, distinctUntilChanged, debounceTime, tap} from 'rxjs/operators';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, ChangeDetectorRef, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';





import { DashboardServiceService } from '../../athlete-portal/common-services/dashboard-service.service'
import { DOCUMENT, } from '@angular/platform-browser';
import { SearchDetailsComponent } from './search-details/search-details.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { LocalstorageService } from './../common-services/localstorage.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, AfterViewInit {
  query;
  title;
  loading;
  athleteProfile;

  @ViewChild('debounceSearch') text: ElementRef;
  @Input('data') searchResults: string[] = [];
  page: number = 1;
  modalRef: BsModalRef;
  constructor(private modalService: BsModalService, @Inject(DOCUMENT) private document: Document, 
              private cd: ChangeDetectorRef, private route: ActivatedRoute,
              private router: Router, private dashboardService: DashboardServiceService,
              private localstorageService: LocalstorageService) {

  }

  formatDescription(str) {
    var d = document.createElement('div');
    d.innerHTML = str;
    return d.textContent.replace('READ MORE', '');
  }

  getResults(search) {
    this.loading = true;
    this.dashboardService.getSearchResults(search).subscribe(res => {
      console.log(res.body.response);
      if (res.header.status == "success") {
        this.searchResults = res.body.response;
        this.page = 1;
        this.cd.detectChanges();
      }
      this.loading = false;
    }, (err) => {
      this.loading = false;
      console.error(err);
    })
  }


  openSearchDetails(item) {
    console.log(item);

    if (item.result_type == "article") {
      this.dashboardService.showArticle(item.id).subscribe((res) => {
        console.log(res);
        if (res.header.status == "success") {
          item.article = res.body.response.body;
          this.modalRef = this.modalService.show(SearchDetailsComponent, { class: 'modal-lg', backdrop: 'static' });
          this.modalRef.content.item = item;
          this.modalRef.content.displayModal = this.modalRef;
        }
      })
    } else {
      this.modalRef = this.modalService.show(SearchDetailsComponent, { class: 'modal-lg', backdrop: 'static' });
      this.modalRef.content.item = item;
      this.modalRef.content.displayModal = this.modalRef;
    }


  }

  search(query) {
    if (query == "") {
      this.searchResults = [];
      this.cd.detectChanges();
    }
    this.router.navigate(['/support'], { queryParams: { query: query } });
    this.getResults(query);
  }

  ngOnInit() {
    this.route.queryParams.subscribe((res) => {
      this.query = res.query;
      this.title = this.query;
      this.getResults(this.title);
    })

    this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
  }

  ngAfterViewInit() {
    let text$ = observableFromEvent(this.text.nativeElement, 'keyup').pipe(
      tap(() => console.log("keyup")),
      debounceTime(500),
      distinctUntilChanged(),
      map(() => this.search(this.query)),)
      .subscribe(res => console.log(res));
  }

}
