import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from "../../athlete-portal/common-services/authentication.service";
import { isiOSApp } from "../../utils/browser";
import { CoachSubscriptionService } from '../coach-subscription.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmationModalComponent } from '../../athlete-portal/common-components/confirmation-modal/confirmation-modal.component';
import { CommonUtils } from '../../athlete-portal/common-util/common-utils';

@Component({
  selector: 'app-coach-subscription-options',
  templateUrl: './coach-subscription-options.component.html'
})
export class CoachSubscriptionOptionsComponent implements OnInit {
  coachCurrentSubscription;
  subscriptionLevels;
  modalRef: BsModalRef;

  constructor(
    private authService: AuthenticationService,
    private _coachSubscriptionService: CoachSubscriptionService,
    private _router: Router,
    private route: ActivatedRoute,
    private _modalService: BsModalService,
  ) {
  }

  async ngOnInit() {
    if (isiOSApp()) {
      return this.authService.logout();
    }

    this.route.queryParams.subscribe(async (res) => {
      if (res.accessToken) {
        localStorage.setItem('accessToken', res.accessToken);
      }
      this.subscriptionLevels       = await this._coachSubscriptionService.getCoachSubscriptionLevels();
      this.coachCurrentSubscription = await this._coachSubscriptionService.getCoachCurrentSubscription();
    });
  }

  isCurrentSubscription(subLevelId: number) {
    if (!this.coachCurrentSubscription) {
      return false;
    }
    return this.coachCurrentSubscription.subLevelId === subLevelId;
  }

  getPricePart(price: number, part: string) {
    if (part === 'int') return Math.trunc(price).toString();
    else if (part === 'dec') {
      const fractionalPrice = price - Math.trunc(price);
      return fractionalPrice ? fractionalPrice.toFixed(2).slice(2) : '';
    };
  }

  getActionName(subLevelId: number) {
    if (!this.coachCurrentSubscription) {
      return 'Activate';
    }
    const subLevel = this.subscriptionLevels.find(s => s.levelId === subLevelId);
    const currentSubLevel = this.subscriptionLevels.find(s => s.levelId === this.coachCurrentSubscription.subLevelId);
    if (currentSubLevel.priceLevel > subLevel.priceLevel) {
      return 'Downgrade';
    } else if (currentSubLevel.priceLevel < subLevel.priceLevel) {
      return 'Upgrade';
    }
  }

  getSubDescriptionHtml(subLevel: any) {
    if (!this.coachCurrentSubscription) {
      return 'Activate';
    }
    const currentSubLevel = this.subscriptionLevels.find(s => s.levelId === this.coachCurrentSubscription.subLevelId);
    if (currentSubLevel.priceLevel > subLevel.priceLevel) {
      return `Downgrade to <strong>${subLevel.levelName}</strong>`;
    } else if (currentSubLevel.priceLevel < subLevel.priceLevel) {
      return `Upgrade to <strong>${subLevel.levelName}</strong>`;
    }
  }

  goToCoachCheckout(subLevelId: number) {
    const actionName = this.getActionName(subLevelId);
    if (actionName === 'Downgrade') {

      this.modalRef = this._modalService.show(ConfirmationModalComponent);
      this.modalRef.content.message =
        `Are you sure you want to ${actionName.toLowerCase()}?`
        + ` Your subscription change will take effect immediately.`
        + ` No refunds from your current subscription are given.`;
      this.modalRef.content.successBtnClass = 'btn-primary';
      this.modalRef.content.displayModal = this.modalRef;

      this.modalRef.content.confirmation.subscribe(async decision => {
        if (!decision) {
          return;
        }
        if(!this.isAthleteLimitExceeded(subLevelId)) {
          this._router.navigate(['/coach/subscription-options/checkout'], { queryParams: { id: subLevelId } });
        }
      });
    } else {
      this._router.navigate(['/coach/subscription-options/checkout'], { queryParams: { id: subLevelId } });
    }
  }

  isAthleteLimitExceeded(subLevelId: number) {
    const { athleteLimit, levelName } = this.subscriptionLevels.find(s => s.levelId === subLevelId);
    const noOfAssignedAthletes = this.coachCurrentSubscription.noOfAssignedAthletes;
    if (noOfAssignedAthletes > athleteLimit) {
      CommonUtils.modalMessage('Athlete Limit Exceeds', `${levelName} subscription allows only ${athleteLimit}. Please contact support for further assistance.`,
                                      this.modalRef, 'error', this._modalService, 'DISMISS');
      return true;
    } else {
      return false;
    }
  }
}
