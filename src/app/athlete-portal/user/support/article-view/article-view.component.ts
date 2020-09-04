import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SupportService } from '../support.service';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-article-view',
  templateUrl: './article-view.component.html',
  styleUrls: ['./article-view.component.scss']
})
export class ArticleViewComponent implements OnInit {

  @Input() articleId;
  @Input() articleType;
  @Input() sectionTitle;
  @Input() recommendedArticleIds;
  @Output() recommendationToggled = new EventEmitter();
  @Output() back = new EventEmitter<void>();
  @Output() backToRecommended = new EventEmitter<void>();

  articleInfo = {};
  loading = false;

  constructor(private supportService: SupportService, private router: Router, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.getArticle();
  }

  async getArticle() {
    try {
      this.loading = true;
      this.articleInfo = await this.supportService.getArticle(this.articleId, this.articleType);
      this.loading = false;
    } catch (err) {
      this.loading = false;
      console.error(err);
    }
  }

  isRecommended() {
    if (!this.articleId) { return false; }
    return this.recommendedArticleIds.indexOf(parseInt(this.articleId, 10)) !== -1;
  }

  htmlDecode(input) {
    const doc = new DOMParser().parseFromString(input, 'text/html');
    const replacedContent = doc.documentElement.textContent.replace(/https:\/\/support.tridot.com\/hc\/en-us\/articles/g, 'support');
    return this.sanitizer.bypassSecurityTrustHtml(replacedContent);
  }

  toggleRecommendation() {
    this.recommendationToggled.emit(this.articleInfo);
  }

  backToList() {
    this.back.emit();
  }

  public backToHome(): void {
    this.backToRecommended.emit();
  }

}
