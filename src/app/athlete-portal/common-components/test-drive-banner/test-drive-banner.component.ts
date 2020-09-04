import { Component, OnInit } from '@angular/core';
import { UserProfileService } from "../../user/user-profile/user-profile.service";

@Component({
  selector: 'app-test-drive-banner',
  templateUrl: './test-drive-banner.component.html',
  styleUrls: ['./test-drive-banner.component.scss']
})
export class TestDriveBannerComponent implements OnInit {

  subscription;

  constructor(private userProfileService: UserProfileService) { }

  async ngOnInit() {
    this.subscription = await this._getSubscription();
  }

  private async _getSubscription() {
    const response = await this.userProfileService.subscription().toPromise();
    return response.body.response;
  }
}
