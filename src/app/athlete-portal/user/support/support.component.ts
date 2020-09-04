import Debounce from 'debounce-decorator';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { SupportService } from "./support.service";
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { SubmitRequestComponent } from './submit-request/submit-request.component';
import { getWindowWidth } from '../../../utils/browser';
import { DEBOUNCE_INTERVAL_DEFAULT_MS } from '../../constants/constants';

const MAX_EXCERPT_LENGTH = 300;

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {
  modalRef: BsModalRef;
  loadingSections = false;
  loadingSearchResults = false;
  sectionsWithArticles;
  sections = [];
  selectedSectionIndex = -1;
  selectedSectionWithArticles = {};
  recommendedArticleIds = [];
  recommendedArticles;
  searchText = "";
  isSearchMode = false;
  alerts = [];
  selectedArticleId = undefined;
  viewSupportTickets = false;
  mobile = false;

  constructor(
    private supportService: SupportService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
  ) {
  }

  async ngOnInit() {
    this.mobile = getWindowWidth(window) < 576;
    
    await Promise.all([
      this.getSections(),
      this.getRecommended()
    ]);

    this.route.queryParams.subscribe(({query, action}) => {
      this.searchText = query;
      if (action === 'submit') {
        this.fireSearch();
        this.openRequestModel();
      }
    });

    this.route.params.subscribe(params => {
      this.selectArticle(params.articleId);
    });

  }

  async getSections() {
    try {
      this.loadingSections = true;
      this.sectionsWithArticles = await this.supportService.getSections();
      this.sections = this.sectionsWithArticles.map((ar, i) => {
        const section = ar.section;
        section.index = i;
        section.count = ar.articles.length;
        return section;
      });
    } catch (err) {
      console.error(err);
    } finally {
      this.loadingSections = false;
    }
  }

  async getRecommended() {
    try {
      this.loadingSearchResults = true;
      this.recommendedArticles = await this.supportService.getRecommended();
      this.recommendedArticleIds = this.recommendedArticles.map(article => parseInt(article.contentId));
      if (this.selectedSectionIndex === -1 && !this.isSearchMode) {
        this.selectedSectionWithArticles = {
          section: "Recommended Articles", articles: this.recommendedArticles.map(article => {
            return { id: article.contentId, articleType: article.contentType, body: this._getExcerpt(this.htmlDecode(this.htmlDecode(article.contentBody))), title: article.contentSubject }
          }), recommended: true
        };
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.loadingSearchResults = false;
    }
  }

  sectionChanged(event) {
    this.viewSupportTickets = false;
    this.selectedSectionIndex = event.index;
    if (event.index != -1)
      this.selectedSectionWithArticles = {
        section: this.sections[event.index].name, articles: this.sectionsWithArticles[event.index].articles.map(article => {
          return { id: article.id, articleType: article.articleType, body: this._getExcerpt(this.htmlDecode(article.body)), title: article.title }
        }), recommended: false
      };
    else
      this.selectedSectionWithArticles = {
        section: "Recommended Articles", articles: this.recommendedArticles.map(article => {
          return { id: article.contentId, articleType: article.contentType, body: this._getExcerpt(this.htmlDecode(this.htmlDecode(article.contentBody))), title: article.contentSubject }
        }), recommended: true
      };

  }

  htmlDecode(input) {
    const {documentElement} = new DOMParser().parseFromString(input, "text/html");
    return documentElement.textContent;
  }

  private _getExcerpt(input: string) {
    const sentences = input.match(/[^.!?\n]+[.!?\n]/g);
    if (!sentences) {
      return input.substring(0, MAX_EXCERPT_LENGTH) + '...';
    }
    let excerpt = '';
    for (const sentence of sentences) {
      if (excerpt.length + sentence.length <= MAX_EXCERPT_LENGTH || !excerpt.length) {
        excerpt += sentence;
      } else {
        return excerpt;
      }
    }
  }

  async toggleRecommendation(article) {
    const recommendedArticles = this.recommendedArticles.filter(rec => { return parseInt(rec.contentId) == parseInt(article.id) });
    if (recommendedArticles.length == 1) {
      await this.supportService.unrecommendArticle(recommendedArticles[0]);
    } else {
      await this.supportService.recommendArticle(article);
    }
    this.getRecommended();
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  async fireSearch() {
    this.viewSupportTickets = false;
    if (this.searchText && this.searchText.length > 0) {
      this.selectedSectionIndex = -1;
      this.isSearchMode = true;
      const searchResults = await this._getSearchResults(this.searchText);
      this.selectedSectionWithArticles = {
        section: "Search Results for \"" + this.searchText + "\"", articles: searchResults.map(article => {
          return { id: article.id, articleType: article.result_type, body: this._getExcerpt(this.htmlDecode(article.body)), title: article.title }
        }), recommended: false
      };
      this.searchText = "";
    } else {
      this.isSearchMode = false;
      this.sectionChanged({ index: -1 });
    }
  }

  selectSection(title) {
    this.viewSupportTickets = false;
    const section = this.sections.find(s => s.name === title);
    if (section) {
      this.sectionChanged({ index: section.index });
    }
  }

  selectArticle(articleId) {
    this.viewSupportTickets = false;
    this.sectionChanged({ index: -1 });
    this.selectedArticleId = articleId;
  }

  openRequestModel() {
    this.modalRef = this.modalService.show(SubmitRequestComponent);
    this.modalRef.content.displayModal = this.modalRef;
    this.modalRef.content.ticketId.subscribe(ticketId => {
      //do not fetch the tickets again here as it takes some time for the tickets to show up
    });

  }

  openSupportRequests() {
    this.viewSupportTickets = true;
  }

  private async _getSearchResults(searchText: string) {
    try {
      this.loadingSearchResults = true;
      return await this.supportService.getSearchResults(searchText)
    } finally {
      this.loadingSearchResults = false;
    }
  }

}
