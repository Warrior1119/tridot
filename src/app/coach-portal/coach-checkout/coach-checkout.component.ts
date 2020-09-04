import { Component, OnInit, ViewChild, ChangeDetectorRef} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from "../../athlete-portal/common-services/authentication.service";
import { DEFAULT_ERROR_MESSAGE } from '../../athlete-portal/constants/constants';
import { Country } from '../../athlete-portal/common-model/country.model';
import { State } from '../../athlete-portal/common-model/state.model';
import { GlobalService } from '../../athlete-portal/common-services/global.service';
import { LocalstorageService } from '../../athlete-portal/common-services/localstorage.service';
import { StripeGatewayService } from '../../athlete-portal/user/subscription-options/stripe-gateway.service';
import { isiOSApp } from "../../utils/browser";
import { CoachSubscriptionService } from '../coach-subscription.service';

export enum Mode {
  Payment,
  Success,
}

@Component({
  selector: 'app-coach-checkout',
  templateUrl: './coach-checkout.component.html',
  styleUrls: ['./../../athlete-portal/user/subscription-options/checkout/checkout.component.scss']
})
export class CoachCheckoutComponent implements OnInit {
  stripeCardNumber: any;
  stripeCardExpiry: any;
  stripeCardCvc: any;
  cardHandler = this.onChange.bind(this);
  error: string;
  stripeCardSetupClientSecret = '';
  stripePaymentMethodId = null;

  get Mode() { return Mode; }

  mode = Mode.Payment;

  athleteProfile: any;
  coachPaymentDetails;
  subscriptionLevelId;
  isDowngrade = false;
  subOptions;
  subscriptionLevelDetails;
  cancelSub;
  countries: Country[] = [];
  billingStates: State[] = [];

  selectedSubscription;
  expirationDateError;
  promoError;
  sameAsAccountVisible = true;
  sameAsAccount = true;

  responseMessage = {
    message: '',
    class: ''
  };

  elementStyles = {
    base: {
      color: '#32325D',
      fontWeight: 500,
      fontFamily: 'Source Code Pro, Consolas, Menlo, monospace',
      fontSize: '16px',
      fontSmoothing: 'antialiased',

      '::placeholder': {
        color: '#CFD7DF',
      },
      ':-webkit-autofill': {
        color: '#e39f48',
      },
    },
    invalid: {
      color: '#E25950',

      '::placeholder': {
        color: '#FFCCA5',
      },
    },
  };

  elementClasses = {
    focus: 'focused',
    empty: 'empty',
    invalid: 'invalid',
  };

  isBusy = false;
  promoCodeSuccess = false;
  promoCodeError = false;

  paymentGatewaySource = '';
  showStripeElements = false;
  disableNormalCardElements = false;
  isEditable = false;
  stripe;

  @ViewChild('form') form: NgForm;
  @ViewChild('formPromo') formPromo: NgForm;

  constructor(
    private _coachSubscriptionService: CoachSubscriptionService,
    private _stripeGatewayService: StripeGatewayService,
    private _route: ActivatedRoute,
    private _globalService: GlobalService,
    private _changeDetector: ChangeDetectorRef,
    private localstorageService: LocalstorageService,
    private authService: AuthenticationService,
  ) {
    this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
  }

  async ngOnInit() {
    if (isiOSApp()) {
      return this.authService.logout();
    }

    const countriesRes = await this._globalService.getCountries().toPromise();
    this.countries = [
      countriesRes.find(x => x.code === 'US'),
      countriesRes.find(x => x.code === 'CA'),
      countriesRes.find(x => x.code === 'AU'),
    ].concat(countriesRes.filter(x => x.code !== 'US' && x.code !== 'CA' && x.code !== 'AU'));
    this._route.queryParams.subscribe(async ({id}) => {
      this.subscriptionLevelId = id;
      this.getCoachPaymentDetails();
      this.subscriptionLevelDetails = await this.getSubscriptionLevelDetails();
    });
  }

  get selectedState() {
    if (!this.coachPaymentDetails) {
      return;
    }
    const foundState = this.billingStates.find(state => Object.values(state).includes(this.coachPaymentDetails.billingAddress.state));
    return (foundState && foundState.code) || this.coachPaymentDetails.billingAddress.state;
  }

  set selectedState(code: string) {
    this.coachPaymentDetails.billingAddress.state = code;
  }

  async getCoachPaymentDetails() {
    try {
      this.coachPaymentDetails = await this._coachSubscriptionService.getCoachPaymentDetails();

      this.coachPaymentDetails.creditCardData = this.coachPaymentDetails.creditCardData || {};
      this.coachPaymentDetails.billingAddress = this.coachPaymentDetails.billingAddress || {};

      const selectedBillingCountry = this.countries.find(country => country.code === this.coachPaymentDetails.billingAddress.country);
      this.billingStates = selectedBillingCountry ? selectedBillingCountry.states : null;

      if (this.coachPaymentDetails.creditCardData.ccNumber) {
        this.showStripeElements = false;
        this.disableNormalCardElements = true;
      } else {
        this.showStripeElements = true;
        this._changeDetector.detectChanges();
        await this.mountStripeCard();
      }
    } catch (err) {
      console.error(err);
    };
  }

  public async onEditCardDetails() {
    this.showStripeElements = true;
    this.isEditable = true;
    this._changeDetector.detectChanges();
    await this.mountStripeCard();
  }

  public async onCancelEditCardDetails() {
    this.showStripeElements = false;
    this.isEditable = false;
  }

  private async mountStripeCard() {
    const publishableKey = await this._stripeGatewayService.getPublishableKeyForCoach(this.subscriptionLevelId);

    this.stripe = Stripe(publishableKey);
    const elements = this.stripe.elements();

    this.stripeCardNumber = elements.create('cardNumber', {
      style: this.elementStyles,
      classes: this.elementClasses,
    });
    this.stripeCardNumber.mount('#stripe-card-number');
    this.stripeCardNumber.addEventListener('change', this.cardHandler);

    this.stripeCardExpiry = elements.create('cardExpiry', {
      style: this.elementStyles,
      classes: this.elementClasses,
    });
    this.stripeCardExpiry.mount('#stripe-card-expiry');

    this.stripeCardCvc = elements.create('cardCvc', {
      style: this.elementStyles,
      classes: this.elementClasses,
    });
    this.stripeCardCvc.mount('#stripe-card-cvc');

    const clientIntentRes = await this._stripeGatewayService.createClientIntentForCoach(this.subscriptionLevelId);
    this.stripeCardSetupClientSecret = clientIntentRes.client_secret;
  }

  async changeSubscription() {
    this.responseMessage.message = '';
    this.responseMessage.class = '';

    const data = {
      firstName: this.coachPaymentDetails.billingFirstName,
      lastName: this.coachPaymentDetails.billingLastName,
      billingAddress: {
        alternatePhone: this.coachPaymentDetails.billingAlternatePhone,
        address1: this.coachPaymentDetails.billingAddress.address1,
        address2: this.coachPaymentDetails.billingAddress.address2,
        city: this.coachPaymentDetails.billingAddress.city,
        state: this.coachPaymentDetails.billingAddress.state,
        country: this.coachPaymentDetails.billingAddress.country,
        zip: this.coachPaymentDetails.billingAddress.zip
      },
    } as any;

    this.isBusy = true;

    if (this.showStripeElements) {
      await this.confirmCardSetup();
      if (this.stripePaymentMethodId) {
        data.paymentMethodId = this.stripePaymentMethodId;
      } else {
        this.isBusy = false;
        return;
      }
    }

    try {
      const res: any = await this._coachSubscriptionService.changeSubscription(this.subscriptionLevelId, data);
      if (res.header.status == 'success') {
        this.mode = Mode.Success;
      } else {
        this.responseMessage.message = DEFAULT_ERROR_MESSAGE;
        this.responseMessage.class = 'alert-warn'
        this.isBusy = false;
      }
    } catch (err) {
      this.responseMessage.message = err.error.body.response.msg || DEFAULT_ERROR_MESSAGE;
      this.responseMessage.class = 'alert-danger'
      this.isBusy = false;
    }
  }



  async onCountryCodeChanged() {
    this.billingStates = this._getBillingStates(this.coachPaymentDetails.billingAddress.country);
    this.coachPaymentDetails.billingAddress.state = '';
  }

  private _getBillingStates(countryCode: string) {
    const selectedCountry = this.countries.find(country => country.code === countryCode);
    return selectedCountry ? selectedCountry.states : null;
  }

  private _isBillingAddressComplete(subscription) {
    try {
      return subscription.billingFirstName
          && subscription.billingLastName
          && subscription.billingAddress
          && this._isAddressComplete(subscription.billingAddress);
    } catch(err) {
      return false;
    }
  }

  private _isAddressComplete(accountAddress) {
    return Boolean(accountAddress
        && accountAddress.address1
        && accountAddress.city
        && accountAddress.state
        && accountAddress.zip
        && accountAddress.country);
  }

  private async getSubscriptionLevelDetails() {
    return await this._coachSubscriptionService.getSubscriptionLevelDetails(this.subscriptionLevelId);
  }

  async confirmCardSetup() {
    this.stripePaymentMethodId = null;
    const result = await this.stripe.confirmCardSetup(this.stripeCardSetupClientSecret, {
        payment_method: {
          card: this.stripeCardNumber,
        }
      });
      if (result.error) {
        console.error("Stripe Error during confirmCardSetup: ", result);
        this.responseMessage.message = result.error.message;
        this.responseMessage.class = 'alert-danger';
        this.stripePaymentMethodId = null;
      } else {
        this.stripePaymentMethodId = result.setupIntent.payment_method;
      }
  }

  onChange({ error }) {
    if (error) {
      this.error = error.message;
    } else {
      this.error = null;
    }
    this._changeDetector.detectChanges();
  }

  public closeWindow(): void {
    window.close();
  }
}
