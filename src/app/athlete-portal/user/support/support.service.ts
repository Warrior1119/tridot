import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';



import { LocalstorageService } from './../../common-services/localstorage.service';

@Injectable()
export class SupportService {

  constructor(private http: HttpClient, 
              private localstorageService: LocalstorageService) {
  }

  private get accessToken() {
    return this.localstorageService.getAccessToken();
  }

  private get memberType() {
    return localStorage["tridot.usertype"].replace(/"/g, "");;
  }

  async getSections() {
    try {
      const res: any = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/km/sections`,
        { header: { accessToken: this.accessToken }, body: { memberId: this.localstorageService.getMemberId(), userType: this.memberType } }).toPromise();
      return res.body.response;
    } catch (err) {
      throw err;
    }
  }

  async getRecommended() {
    try {
      const res: any = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/km/recommended`,
        { header: { accessToken: this.accessToken }, body: { memberId: this.localstorageService.getMemberId(), userType: this.memberType } }).toPromise();
      return res.body.response;
    } catch (err) {
      throw err;
    }
  }

  async getSearchResults(searchText) {
    try {
      const res: any = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/km/getsearchresult`,
        { header: { accessToken: this.accessToken }, body: { memberId: this.localstorageService.getMemberId(), userType: this.memberType, search_text: searchText } }).toPromise();
      return res.body.response;
    } catch (err) {
      throw err;
    }
  }

  async submitTicket(ticket) {
    try {
      const res: any = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/km/submitticket`,
        {
          header: { accessToken: this.accessToken },
          body: {
            memberId: this.localstorageService.getMemberId(),
            userType: this.memberType,
            ticketDescription: ticket.description,
            ticketSubject: ticket.subject
          }
        }).toPromise();
      return res.body.response;
    } catch (err) {
      throw err;
    }
  }


  async getArticle(articleId, articleType) {
    try {
      const res: any = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/km/showarticle`,
        { header: { accessToken: this.accessToken }, body: { memberId: this.localstorageService.getMemberId(), userType: this.memberType, article_type: articleType, articleId: articleId } }).toPromise();
      return res.body.response;
    } catch (err) {
      throw err;
    }
  }

  async unrecommendArticle(recommendedArticleInfo) {
    try {
      const res: any = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/km/unrecommendcontent`,
        {
          header: { accessToken: this.accessToken },
          body: {
            athleteId: this.localstorageService.getMemberId(),
            userType: this.memberType,
            contentId: recommendedArticleInfo.contentId,
            contentType: recommendedArticleInfo.contentType,
            recommendedId: recommendedArticleInfo.id
          }
        }).toPromise();
      return res.body.response;
    } catch (err) {
      throw err;
    }
  }

  async recommendArticle(article) {
    try {
      const res: any = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/km/recommendcontent`,
        {
          header: { accessToken: this.accessToken },
          body: {
            athleteId: this.localstorageService.getMemberId(),
            coachId: this.localstorageService.getMemberId(),
            coachNotes: "",
            contentId: article.id,
            contentType: article.articleType || "article",
            memberId: this.localstorageService.getMemberId(),
            recommendedByType: this.memberType,
            userType: this.memberType,
          }
        }).toPromise();
      return res.body.response;
    } catch (err) {
      throw err;
    }
  }

  async supportTickets() {
    try {
      const res: any = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/km/tickets`,
        {
          header: { accessToken: this.accessToken },
          body: {
            memberId: this.localstorageService.getMemberId(),
            userType: this.memberType,
          }
        }).toPromise();
      return res.body.response;
    } catch (err) {
      throw err;
    }
  }

  async getTicketComments(ticketId) {
    try {
      const res: any = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/km/getcomments`,
        {
          header: { accessToken: this.accessToken },
          body: {
            commentType: "ticket",
            entityId: ticketId,
            memberId: this.localstorageService.getMemberId(),
            userType: this.memberType,
          }
        }).toPromise();
      return res.body.response;
    } catch (err) {
      throw err;
    }
  }

  async submitTicketComment(ticketId, comment) {
    try {
      const res: any = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/km/submitticketcomment`,
        {
          header: { accessToken: this.accessToken },
          body: {
            attachments: "",
            authorId: this.localstorageService.getMemberId(),
            body: comment,
            id: ticketId,
            publicComment: true,
            uploads: "",
            userType: this.memberType,
          }
        }).toPromise();
      return res.body.response;
    } catch (err) {
      throw err;
    }
  }
}
