import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { isiOSApp } from "../../../utils/browser";
import { AuthenticationService } from "../../common-services/authentication.service";

import { UserProfileService } from '../user-profile/user-profile.service'
import { ConfirmationModalComponent } from '../../common-components/confirmation-modal/confirmation-modal.component';
import { MessageModalComponent } from '../../common-components/message-modal/message-modal.component';
import { CancelSubscriptionModalComponent } from './cancel-subscription-modal/cancel-subscription-modal.component';
import { UpcomingRacesService } from '../../race-x/upcoming-races/upcoming-races.service';
import { ALL_SUBSCRIPTIONS } from '../../constants/constants';
import { LocalstorageService } from './../../common-services/localstorage.service';
import { BrowserScrollService } from '../../../utils/browser-scroll-service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-subscription-options',
  templateUrl: './subscription-options.component.html',
  styleUrls: ['./subscription-options.component.scss']
})
export class SubscriptionOptionsComponent implements OnInit {

  athleteProfile: any;
  subscription;
  cancelSub: boolean;
  modalRef: BsModalRef;
  subOptions;
  scheduledARaces: number;
  scheduledBRaces: number;

  constructor(
    private browserScrollService: BrowserScrollService,
    private _modalService: BsModalService,
    private _userProfileService: UserProfileService,
    private _router: Router,
    private _upcomingRacesService: UpcomingRacesService,
    private localstorageService: LocalstorageService,
    private authService: AuthenticationService,
  ) {
    this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
  }

  get subscriptionStatus() {
    if (this.athleteProfile.trialPeriodExpired == 'true') {
      return 'Trial Expired';
    }
    if (this.athleteProfile.inTrialPeriod == 'true') {
      return 'Trial';
    }
    if (!this.athleteProfile.subscriptionId || +this.athleteProfile.subscriptionDaysRemain < 0) {
      return 'Canceled';
    }
    if (this.subscription && this.subscription.markedForCancel == 'true') {
      return 'Canceled';
    }
    return 'Current';
  }

  async ngOnInit() {
    if (isiOSApp()) {
      return this.authService.logout();
    }

    this.getSubscription();
    this.subOptions = await this._userProfileService.subOptions();
    this.subOptions = this.subOptions.map(option => {
      const subLocalData = ALL_SUBSCRIPTIONS.find(sub => sub.priceLevel === option.priceLevel)
      return { ...option, ...subLocalData };
    });
    this._getNumOfScheduledRaces();
  }

  async getSubscription() {
    this.subscription = null;
    try {
      const res = await this._userProfileService.subscription().toPromise();
      this.subscription = res.body.response;
    } catch (err) {
      console.error(err);
    }
  }

  isCurrentSubscription(subLevelId: number) {
    if (!this.subscription || this.subscriptionStatus === 'Trial' || this.subscriptionStatus === 'Trial Expired') {
      return false;
    }
    return this.subscription && this.subscription.subscriptionLevelId === subLevelId;
  }

  getPricePart(price: number, part: string) {
    if (part === 'int') return Math.trunc(price).toString();
    else if (part === 'dec') {
      const fractionalPrice = price - Math.trunc(price);
      return fractionalPrice ? fractionalPrice.toFixed(2).slice(2) : '';
    };
  }

  getActionName(subLevelId: number) {
    if (!this.subscription || this.subscriptionStatus === 'Trial' || this.subscriptionStatus === 'Trial Expired') {
      return 'Activate';
    }
    const sub = this.subOptions.find(s => s.subLevel === subLevelId);
    if (this.subscription.priceLevel > sub.priceLevel) {
      return 'Downgrade';
    } else if (this.subscription.priceLevel < sub.priceLevel) {
      return 'Upgrade';
    }
  }

  getSubDescriptionHtml(sub: any) {
    if (!this.subscription || this.subscriptionStatus === 'Trial' || this.subscriptionStatus === 'Trial Expired') {
      return 'Activate';
    }
    if (this.subscription.priceLevel > sub.priceLevel) {
      return `Downgrade to <strong>${sub.subscriptionName}</strong>`;
    } else if (this.subscription.priceLevel < sub.priceLevel) {
      return `Upgrade to <strong>${sub.subscriptionName}</strong>`;
    }
  }

  isActivationInProgress(sub: any) {
    return sub.associatedWithCoach && (!sub.subscriptionCost || sub.subscriptionCost == 0.0) && (this.subscriptionStatus === 'Trial' || this.subscriptionStatus === 'Trial Expired');
  }

  goToCheckout(subLevelId: number) {
    if (this.getActionName(subLevelId) === 'Downgrade') {
      const currentSubOption = this.subOptions.find(s => s.subLevel === this.subscription.subscriptionLevelId);
      this.modalRef = this._modalService.show(ConfirmationModalComponent);
      if (currentSubOption.associatedWithCoach) {
        this.modalRef.content.modalTitle = "Warning downgrading will cancel your coach designed training";
        this.modalRef.content.message =
              `When downgrading to a lower subscription level, you will loose access to your coach and your coach-designed training.`;
        this.modalRef.content.modalType = 'warning';
      } else {
        this.modalRef.content.message =
        `Are you sure you want to ${this.getActionName(subLevelId).toLowerCase()}?`
        + ` Your subscription change will take effect immediately.`
        + ` No refunds from your current subscription are given.`;
      }

      this.modalRef.content.successBtnClass = 'btn-primary';
      this.modalRef.content.displayModal = this.modalRef;

      this.modalRef.content.confirmation.subscribe(async decision => {
        if (!decision) {
          return;
        }

        // Check if race limit exceeded
        if (!await this._isDowngradeFeasible(subLevelId)) {
          this.raceLimitExceeded(subLevelId);
          return;
        }

        this._router.navigate(['/user/subscription-options/checkout'], { queryParams: { id: subLevelId } });
      });
    } else {
      this._router.navigate(['/user/subscription-options/checkout'], { queryParams: { id: subLevelId } });
    }
  }

  public onClickActivationInProcess(isTrialExpired: boolean): void {
    this.modalRef = this._modalService.show(MessageModalComponent);
    this.modalRef.content.displayModal = this.modalRef;
    this.modalRef.content.btnSuccAndErrorText = 'OK';
    if (isTrialExpired) {
      this.modalRef.content.modalTitle = 'Trial Expired';
      this.modalRef.content.message = 'Your trial period has expired. Please contact your coach or customer support to activate your account.';
      this.modalRef.content.btnSuccAndErrorStyle = 'btn btn-light btn-rounded btn-block btn-lg text-sm';
      this.modalRef.content.imageUrl = "../../../../assets/img/svg/warning-icon.svg";
    } else {
      this.modalRef.content.modalTitle = 'Thanks!';
      this.modalRef.content.message = 'Your activation requires administrator approval. Your account will be set up soon.';
      this.modalRef.content.btnSuccAndErrorStyle = 'btn btn-primary btn-rounded btn-block btn-lg text-sm';
      this.modalRef.content.imageUrl = "../../../../assets/img/svg/success-icon.svg";
    }
  }

  raceLimitExceeded(subLevelId: number) {
    const { subscriptionName, noOfARaces, noOfBRaces } = this.subOptions.find(s => s.subLevel === subLevelId);
    const modalRef2 = this._modalService.show(ConfirmationModalComponent);
    modalRef2.content.message = `${subscriptionName} subscription allows ${noOfARaces} "A" priority race${noOfARaces > 1 ? 's' : ''}
      ${noOfBRaces ? ('and/or ' + noOfBRaces + ' "B" priority race' + (noOfBRaces > 1 ? 's' : '')) : 'and no "B" priority races'} to be scheduled at a time.
      Please remove these races from your Season Planner prior to changing subscription levels.`
    modalRef2.content.successBtnTxt = 'Season Planner';
    modalRef2.content.successBtnClass = 'btn-primary';
    modalRef2.content.displayModal = modalRef2;
    modalRef2.content.confirmation.subscribe(decision => {
      if (decision) {
        this._router.navigate(['/season-planner']);
      }
    });
  }

  openCancelModal() {
    this.modalRef = this._modalService.show(CancelSubscriptionModalComponent, {
      class: 'modal-lg', backdrop: false,
      ignoreBackdropClick: false });
      this.modalRef.content.displayModal = this.modalRef;
  }

  onPan(e) {
    this.browserScrollService.onPan(e);
  }

  onPanEnd(e) {
    this.browserScrollService.onPanEnd(e);
  }

  private async _isDowngradeFeasible(subLevelId) {
    try {
      const res = await this._userProfileService.isDowngradeFeasible(subLevelId).toPromise();
      return res.isFeasible == true;
    } catch (err) {
      console.error(err);
    }
  }

  private async _getNumOfScheduledRaces() {
    const res = await this._upcomingRacesService.getRaces()
    this.scheduledARaces = res.futureRace.filter(race => race.raceCategory === 'A').length;
    this.scheduledBRaces = res.futureRace.filter(race => race.raceCategory === 'B').length;
  }

  appendAPIEndpointPrefix(url){
    return environment.API_ENDPOINT + url;
  }
}
