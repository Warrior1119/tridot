import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalstorageService } from './localstorage.service';
import { SLACK_WEB_HOOK } from '../constants/global.constants';

@Injectable()
export class SlackService {

    // Added tickets to handle these separately
    private static KNOWN_ERRORS: string[] = ["Denied the request for Geolocation", "Failed to determine location",
                                             "commentsPlanned", "billingFirstName", "seasonName", "profile.firstName",
                                             "component.nutrition", "swimVolumePreference",
                                             "Service workers are disabled or not supported by this browser"];
    private static NOTIFICATION_ENABLED_HOST = 'tridot.com';

    private lastMessage = "";

    private options = {
        headers: new HttpHeaders(
          { 'Content-Type': 'application/x-www-form-urlencoded' }
        )
    };

    constructor(private http: HttpClient, 
      private localstorageService: LocalstorageService) { }

    public postErrorOnSlack(error: Error): void {
      try {
        const url = window.location.href; 
        if (this.isEligibleForNotification(url, error)) {
          const message = this.getSlackMessage(url, error);
          this.http.post(SLACK_WEB_HOOK, message , this.options).subscribe((res) => {}, (err) => {});
        } 
      } catch (err) {
        console.error(err);
      }
    }

    private isEligibleForNotification(url :string, error: Error): boolean {
      if (error.stack && url.includes(SlackService.NOTIFICATION_ENABLED_HOST)) {
        if (this.lastMessage === error.message) {
            return false;
        }
        const isKnownError = SlackService.KNOWN_ERRORS.find((val) => {
          return error.message.includes(val);
        });
        if (!isKnownError) {
          this.lastMessage = error.message;
          return true;
        }
      }
      return false;
    }

    private getSlackMessage(url: string, error: Error): any {
      let slackMessage = error.message;
      if (this.localstorageService.hasUserSignedIn()) {
        slackMessage =  slackMessage + ' -- ' + this.localstorageService.getMemberId();
      }
      return {
        channel: '#client-errors',
        text: slackMessage,
        attachments: [{
            author_name: url,
            color: 'danger',
            title: 'Trace',
            text: error.stack
        }]
      }     
    }
}
