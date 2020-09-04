import Debounce from 'debounce-decorator';
import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isiOSApp } from "../../../../utils/browser";
import { AuthenticationService } from "../../../common-services/authentication.service";
import { UserProfileService } from '../../user-profile/user-profile.service';
import { STRIPE_ELEMENT_STYLES, STRIPE_ELEMENT_CLASSES } from './../../subscription-options/stripe.constants';
import { DEFAULT_ERROR_MESSAGE, DEBOUNCE_INTERVAL_DEFAULT_MS } from '../../../constants/constants';
import { Country } from '../../../common-model/country.model';
import { State } from '../../../common-model/state.model';
import { GlobalService } from '../../../common-services/global.service';
import { LocalstorageService } from './../../../common-services/localstorage.service';
import { StripeGatewayService } from '../stripe-gateway.service';

export enum Mode {
  Payment,
  Success,
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
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
  subscription;
  subscriptionLevelId;
  origSubscriptionLevelId;
  isDowngrade = false;
  subOptions;
  chargeInfo;
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
    private _userProfileService: UserProfileService,
    private _stripeGatewayService: StripeGatewayService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _globalService: GlobalService,
    private _changeDetector: ChangeDetectorRef,
    private localstorageService: LocalstorageService,
    private authService: AuthenticationService,
    private cd: ChangeDetectorRef,
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

    this.subOptions = await this._userProfileService.subOptions();
    this._route.queryParams.subscribe(({id}) => {
      this.subscriptionLevelId = id;
      this.origSubscriptionLevelId = this.subscriptionLevelId;
      this.selectedSubscription = this.subOptions.find(x => x.subLevel == this.subscriptionLevelId);
      this.getSubscription();
    });
  }

  async ngAfterViewInit() {

  }

  onChange({ error }) {
    if (error) {
      this.error = error.message;
    } else {
      this.error = null;
    }
    this.cd.detectChanges();
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

  get selectedState() {
    if (!this.subscription) {
      return;
    }
    const foundState = this.billingStates.find(state => Object.values(state).includes(this.subscription.billingAddress.state));
    return (foundState && foundState.code) || this.subscription.billingAddress.state;
  }

  set selectedState(code: string) {
    this.subscription.billingAddress.state = code;
  }

  async getSubscription() {
    try {
      const res = await this._userProfileService.subscription().toPromise();
      this.subscription = res.body.response;

      this.isDowngrade = this.subscription.priceLevel > this.subOptions.find(sub => sub.subLevel == this.subscriptionLevelId).priceLevel;

      // Check if race limit exceeded
      if (this.isDowngrade && !this._isDowngradeFeasible(this.subscriptionLevelId)) {
        this._router.navigate(['/user/subscription-options']);
        return;
      }

      this.subscription.creditCardData = this.subscription.creditCardData || {};
      this.subscription.billingAddress = this.subscription.billingAddress || {};
      this.paymentGatewaySource = this.subscription.paymentGatewaySource;

      this.chargeInfo = await this._getChargeInfo();

      if (this.subscription && !this._isBillingAddressComplete(this.subscription) && this._isAccountAddressComplete(this.subscription)) {
        this.setSameAsAccount(true); // so the user does not need to set this each time
      } else {
        this.sameAsAccount = false;
      }

      if (this.subscription && !this._isAccountAddressComplete(this.subscription)) {
        this.sameAsAccountVisible = false;
      }

      const selectedBillingCountry = this.countries.find(country => country.code === this.subscription.billingAddress.countryCode);
      this.billingStates = selectedBillingCountry ? selectedBillingCountry.states : null;

      if (this.paymentGatewaySource === 'STRIPE') {
        if (!this.subscription.creditCardData.ccNumber) {
          this.showStripeElements = true;
          this.cd.detectChanges();
          await this.mountStripeCard();
        } else {
          this.showStripeElements = false;
          this.disableNormalCardElements = true;
        }
      }

    } catch (err) {
      console.error(err);
    };
  }

  public async onEditCardDetails() {
    this.showStripeElements = true;
    this.isEditable = true;
    this.cd.detectChanges();
    await this.mountStripeCard();
  }

  public async onPaymentGatewayChange() {
    if (this.paymentGatewaySource === 'STRIPE') {
      this.showStripeElements = true;
      this.cd.detectChanges();
      await this.mountStripeCard();
    } else {
      this.showStripeElements = false;
    }
  }

  public async onCancelEditCardDetails() {
    this.showStripeElements = false;
    this.isEditable = false;
  }

  private async mountStripeCard() {
    const publishableKey = await this._stripeGatewayService.getPublishableKey(this.subscriptionLevelId);

    this.stripe = Stripe(publishableKey);
    const elements = this.stripe.elements();

    this.stripeCardNumber = elements.create('cardNumber', {
      style: STRIPE_ELEMENT_STYLES,
      classes: STRIPE_ELEMENT_CLASSES,
    });
    this.stripeCardNumber.mount('#stripe-card-number');
    this.stripeCardNumber.addEventListener('change', this.cardHandler);

    this.stripeCardExpiry = elements.create('cardExpiry', {
      style: STRIPE_ELEMENT_STYLES,
      classes: STRIPE_ELEMENT_CLASSES,
    });
    this.stripeCardExpiry.mount('#stripe-card-expiry');

    this.stripeCardCvc = elements.create('cardCvc', {
      style: STRIPE_ELEMENT_STYLES,
      classes: STRIPE_ELEMENT_CLASSES,
    });
    this.stripeCardCvc.mount('#stripe-card-cvc');

    const clientIntentRes = await this._stripeGatewayService.createClientIntent(this.subscriptionLevelId);
    this.stripeCardSetupClientSecret = clientIntentRes.client_secret;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  async applyPromo(promotionCode: string) {
    this.isBusy = true;
    if (!promotionCode) {
      this.promoCodeError = false;
      this.promoCodeSuccess = false;
      this.formPromo.form.controls.promotionCode.setErrors(null);
      this.clearPromo();
      this.isBusy = false;
      return;
    }
    try {
      await this._userProfileService.postPromotionInfo({
        athleteId: this.athleteProfile.athleteId,
        promotionCode,
        subscriptionLevelId: this.subscriptionLevelId
      });
      this.subscription.creditCardData.promotionCode = promotionCode;
      this.chargeInfo = await this._getChargeInfo();
      if (this.chargeInfo.currenncyCode) {
        this.subscription.currencyCode = this.chargeInfo.currenncyCode;
      }

      if (this.chargeInfo.subscriptionLevelId) {
        this.subscriptionLevelId = this.chargeInfo.subscriptionLevelId;
      }

      if (this.chargeInfo.paymentGatewaySource && this.chargeInfo.subscriptionLevelId &&
              this.chargeInfo.paymentGatewaySource != this.paymentGatewaySource) {
          this.paymentGatewaySource = this.chargeInfo.paymentGatewaySource;
          this.onPaymentGatewayChange();
      }

      this.promoCodeError = false;
      this.promoCodeSuccess = true;
    } catch (err) {
      this.promoCodeError = true;
      this.promoCodeSuccess = false;
      this.clearPromo();
    } finally {
      this.isBusy = false;
    }
  }

  async clearPromo() {
    this.subscription.creditCardData.promotionCode = '';
    this.subscriptionLevelId = this.origSubscriptionLevelId;
    this.chargeInfo = await this._getChargeInfo();
  }

  public clearPromoStatus(): void {
    this.promoCodeError = false;
    this.promoCodeSuccess = false;
  }

  async changeSubscription() {
    this.responseMessage.message = '';
    this.responseMessage.class = '';

    const data = {
      athleteId: this.subscription.athleteId,
      ccCode: this.subscription.creditCardData.cvc,
      ccExpDt: this.subscription.creditCardData.expirationDate,
      ccNumber: this.subscription.creditCardData.ccNumber,
      ccType: this.subscription.creditCardData.cardType,
      promotionCode: this.subscription.creditCardData.promotionCode,
      sameAsAccountAddress: this.sameAsAccount,
      subscriptionLevelId: this.subscriptionLevelId,
    } as any;

    if (this.sameAsAccount) {
      data.sameAsAccountAddress = 'true';
    } else {
      data.sameAsAccountAddress = 'false';
      data.firstName = this.subscription.billingFirstName;
      data.lastName = this.subscription.billingLastName;
      data.mainPhone = this.subscription.billingMainPhone;
      data.alternatePhone = this.subscription.billingAlternatePhone;
      data.address1 = this.subscription.billingAddress.address1;
      data.address2 = this.subscription.billingAddress.address2;
      data.city = this.subscription.billingAddress.city;
      data.state = this.subscription.billingAddress.state;
      data.country = this.subscription.billingAddress.countryCode;
      data.zip = this.subscription.billingAddress.zip;
    }
    this.isBusy = true;

    if (this.paymentGatewaySource === 'STRIPE' && this.showStripeElements) {
      await this.confirmCardSetup();
      if (this.stripePaymentMethodId) {
        data.stripePaymentMethodId = this.stripePaymentMethodId;
      } else {
        this.isBusy = false;
        return;
      }
    }

    try {
      const res: any = await this._userProfileService.changeSubscription(data);
      if (res.header.status == 'success') {
        const resProfile = await this._userProfileService.profile().toPromise();
        this.athleteProfile = resProfile.body.response.athleteProfile;
        localStorage.athleteProfile = JSON.stringify(this.athleteProfile);
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

  validateExpirationDateError(input, isDirty) {
    if (!isDirty) {
      return;
    }
    this.expirationDateError = null;
    if (!input) {
      this.expirationDateError = 'This field is required';
      this.form.form.controls.expirationDate.setErrors({invalid: this.expirationDateError});
      return;
    }
    const SHORT_DATE_REGEX = /^(\d\d)\/(\d\d)$/;
    if (SHORT_DATE_REGEX.test(input)) {
      input = input.replace(SHORT_DATE_REGEX, '$1/20$2');
      this.subscription.creditCardData.expirationDate = input;
      this._changeDetector.detectChanges();
    }
    if (input.indexOf('/') === -1 || input.split('/').length !== 2 || parseInt(input.split('/')[0]) > 12) {
      this.expirationDateError = 'Must be in format mm/yy';
      this.form.form.controls.expirationDate.setErrors({invalid: this.expirationDateError});
      return;
    }
    var ms = new Date(parseInt(input.split('/')[1]), parseInt(input.split('/')[0]) - 1).valueOf();
    if (ms <= new Date().valueOf()) {
      this.expirationDateError = 'Must be in future';
      this.form.form.controls.expirationDate.setErrors({invalid: this.expirationDateError});
      try {window['$']('input[name="expirationDate"]').removeClass('ng-valid');} catch(err){}
      return;
    }
    this.form.form.controls.expirationDate.setErrors(null);
    try {window['$']('input[name="expirationDate"]').addClass('ng-valid');} catch(err){}
  }

  async setSameAsAccount(sameAsAccount: boolean) {
    this.sameAsAccount = sameAsAccount;
    if (sameAsAccount) {
      this.subscription.billingSameAsAccountAddr = true;
      this.subscription.billingFirstName        = this.subscription.firstName;
      this.subscription.billingLastName         = this.subscription.lastName;
      this.subscription.billingEmail            = this.subscription.email;
      this.subscription.billingMainPhone        = this.subscription.mobilePhone;
      this.subscription.billingAlternatePhone   = this.subscription.alternatePhone;
      this.subscription.billingAddress.address1 = this.subscription.accountAddress.address1;
      this.subscription.billingAddress.address2 = this.subscription.accountAddress.address2;
      this.subscription.billingAddress.city     = this.subscription.accountAddress.city;
      this.subscription.billingAddress.state    = this.subscription.accountAddress.state;
      this.subscription.billingAddress.zip      = this.subscription.accountAddress.zip;
      this.subscription.billingAddress.countryCode = this.subscription.accountAddress.countryCode;
      this.billingStates = this._getBillingStates(this.subscription.billingAddress.countryCode);

      const state = this.billingStates.find(x => x.code === this.subscription.accountAddress.state);
      if (state && state.code) {
        this.subscription.billingAddress.state = state.code;
      } else {
        this.subscription.billingAddress.state = this.subscription.accountAddress.state;
      }
    } else {
      this.subscription.billingSameAsAccountAddr = false;
      this.subscription.billingFirstName        = null;
      this.subscription.billingLastName         = null;
      this.subscription.billingEmail            = null;
      this.subscription.billingMainPhone        = null;
      this.subscription.billingAlternatePhone   = null;
      this.subscription.billingAddress.address1 = null;
      this.subscription.billingAddress.city     = null;
      this.subscription.billingAddress.state    = null;
      this.subscription.billingAddress.zip      = null;
      this.subscription.billingAddress.countryCode = null;
      this.billingStates = null;
    }

    this.chargeInfo = await this._getChargeInfo();
  }

  async onCountryCodeChanged() {
    this.billingStates = this._getBillingStates(this.subscription.billingAddress.countryCode);
    this.subscription.billingAddress.state = '';
    this.chargeInfo = await this._getChargeInfo();
  }

  get isCardAMEX() {
    const ccNumber = this.subscription && this.subscription.creditCardData && this.subscription.creditCardData.ccNumber;
    if(ccNumber)
      return ccNumber.length === 15 && ccNumber.charAt(0) == 3;
      else
      return false;
  }

  getBillingSameAsAccountAddr() {
    if (!this.subscription || !this.subscription.accountAddress || !this.subscription.billingAddress) {
      return false;
    }
    return this.subscription.billingFirstName == this.subscription.firstName &&
      this.subscription.billingLastName         == this.subscription.lastName &&
      this.subscription.billingMainPhone        == this.subscription.mobilePhone &&
      this.subscription.billingAlternatePhone   == this.subscription.alternatePhone &&
      this.subscription.billingAddress.address1 == this.subscription.accountAddress.address1 &&
      this.subscription.billingAddress.address2 == this.subscription.accountAddress.address2 &&
      this.subscription.billingAddress.city     == this.subscription.accountAddress.city &&
      this.subscription.billingAddress.state    == this.subscription.accountAddress.state &&
      this.subscription.billingAddress.zip      == this.subscription.accountAddress.zip &&
      this.subscription.billingAddress.countryCode == this.subscription.accountAddress.countryCode;
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

  private _isAccountAddressComplete(subscription) {
    try {
      return subscription.firstName
          && subscription.lastName
          && subscription.accountAddress
          && this._isAddressComplete(subscription.accountAddress);
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
        && accountAddress.countryCode);
  }

  private async _getChargeInfo() {
    return await this._userProfileService.changeSubscriptionTrialRun({
      athleteId: this.subscription.athleteId,
      ccCode: this.subscription.creditCardData.cvc,
      ccExpDt: this.subscription.creditCardData.expirationDate,
      ccNumber: this.subscription.creditCardData.ccNumber,
      ccType: this.subscription.creditCardData.cardType,
      promotionCode: this.subscription.creditCardData.promotionCode,
      isDowngrade: this.isDowngrade,
      subscriptionLevelId: this.subscriptionLevelId,
      countryCode: this.subscription.billingAddress.countryCode,
    });
  }

  private async _isDowngradeFeasible(subLevelId) {
    console.log('_isDonwgradeFeasible', subLevelId);
    try {
      const res = await this._userProfileService.isDowngradeFeasible(subLevelId).toPromise();
      return res.isFeasible == true;
    } catch (err) {
      console.error(err);
    }
  }
}
