import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss']
})
export class ArticleListComponent implements OnInit {

  @Input() _articleList;

  @Input()
  set articleList(list) {
    this._articleList = list;
    this.selectedArticleId = undefined;
    this.pageNumber = 0;
  }

  @Input() recommendedArticleIds;

  @Output() back = new EventEmitter();

  @Output() recommendationToggled = new EventEmitter();

  @Input() selectedArticleId;
  pageNumber;

  constructor() { }

  ngOnInit() {
  }

  backToRecommended() {
    this.back.emit({ index: -1 });
  }

  toggleRecommendation($event) {
    this.recommendationToggled.emit($event);
  }

}
