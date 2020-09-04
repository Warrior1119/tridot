import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { isiOSApp } from "../../../../utils/browser";
import { UserProfileService } from '../../user-profile/user-profile.service';
import { Router } from '@angular/router';
import { LocalstorageService } from './../../../common-services/localstorage.service';
import { PLACEHOLDER_DD_MM_YYYY } from '../../../constants/date-time.constants';
import { getWindowWidth } from '../../../../utils/browser';
import { MOBILE_WIDTH_THRESHOLD, TABLET_WIDTH_THRESHOLD } from '../../../constants/constants';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AccountSettingsComponent implements OnInit {
  phoneNumberPattern = /(\d{3})(\d{3})(\d{4})/;
  phoneNumberFormat = '($1) $2-$3';

  athleteProfile: any;
  subscription;
  changeSubscription;

  ccNumber;
  page;

  editAccount = false;
  editPayment = false;
  isTaxInfoVisible = false;

  get isiOSApp() {
    return isiOSApp();
  }

  constructor(
    private userProfileService: UserProfileService,
    private router: Router,
    private localstorageService: LocalstorageService,
  ) {
    this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
  }

  get isMobile() {
    return getWindowWidth(window) < MOBILE_WIDTH_THRESHOLD;
  }

  get isMobileOrTablet() {
    return getWindowWidth(window) < TABLET_WIDTH_THRESHOLD;
  }

  get prefDateFormatLong () {
    return this.athleteProfile && this.athleteProfile.prefDateFormat === PLACEHOLDER_DD_MM_YYYY
      ? 'D MMMM, YYYY'
      : 'MMMM D, YYYY';
  }

  ngOnInit() {
    this.getSubscription();
  }

  onAccountEdited() {
    this.editAccount = false;
    this.getSubscription();
  }

  onPaymentEdited() {
    this.editPayment = false;
    this.getSubscription();
  }

  get subscriptionStatus() {
    if (this.athleteProfile.trialPeriodExpired == 'true') {
      return 'Trial Expired';
    }
    if (this.athleteProfile.inTrialPeriod == 'true') {
      return 'Trial';
    }
    if (!this.athleteProfile.subscriptionId) {
      return 'Canceled';
    }
    if (this.subscription && this.subscription.markedForCancel == 'true') {
      return 'Canceled';
    }
    return 'Current';
  }

  subscriptionButtonText() {
    return this.subscriptionStatus === 'Trial' || this.subscriptionStatus === 'Trial Expired' ? 'Activate' : 'Change Subscription';
  }

  async getSubscription() {
    try {
      const subscriptionRes = await this.userProfileService.subscription().toPromise();
      this.subscription = subscriptionRes.body.response;
      this.subscription.billingAddress = this.subscription.billingAddress || {};
      this.subscription.creditCardData = this.subscription.creditCardData || {};

      this.isTaxInfoVisible = this._getIsTaxInfoVisible(this.subscription.billingHistory);

      const ccNumber = this.subscription.creditCardData && this.subscription.creditCardData.ccNumber;
      this.ccNumber = ccNumber && ccNumber.substr(ccNumber.length - 4, 4);
    } catch (err) {
      console.error(err);
    }
  }

  private _getIsTaxInfoVisible(history) {
    if (!history || !history.length) {
      return false;
    }

    return history.some(x => x.taxAmount);
  }
}
