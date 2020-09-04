import { Component, Output, ViewChild, EventEmitter, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { UserProfileService } from '../../../user-profile/user-profile.service';
import { Country } from '../../../../common-model/country.model';
import { State } from '../../../../common-model/state.model';
import { GlobalService } from '../../../../common-services/global.service';
import { StripeGatewayService } from '../../../subscription-options/stripe-gateway.service';
import { STRIPE_ELEMENT_STYLES, STRIPE_ELEMENT_CLASSES } from './../../../subscription-options/stripe.constants';
import { BehaviorSubject } from 'rxjs';
declare var $:any;
@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./../../../subscription-options/checkout/checkout.component.scss']
})
export class PaymentMethodComponent implements OnInit {
  @Input() submitSubject: BehaviorSubject<boolean>;

  @Input() subscription = {creditCardData:{}} as any;
  @Input() isMobile;
  @Input() canEdit;
  @Output() updateCard = new EventEmitter();
  @ViewChild('form') form: FormControl;
  
  // canEdit = false;
  countries: Country[] = [];
  billingStates: State[] = [];
  subscriptionOriginal;
  fullName;
  responseMessage = {
    message: '',
    class: ''
  };
  billingAlerts: any = [];
  billingSuccessAlerts: any = [];
  billingLoading = false;
  showUpdateForContact;
  showUpdateForBilling;
  expirationDateError;

  showStripeElements = false;
  stripePaymentMethodId = null;
  stripe;
  stripeCardNumber: any;
  stripeCardExpiry: any;
  stripeCardCvc: any;
  cardHandler = this.onStripCardChange.bind(this);
  error: string;
  stripeCardSetupClientSecret = '';

  constructor(
    private userProfileService: UserProfileService,
    private globalService: GlobalService,
    private router: Router,
    private _changeDetector: ChangeDetectorRef,
    private _stripeGatewayService: StripeGatewayService,
    private cd: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    try {
      const countriesRes = await this.globalService.getCountries().toPromise();
      this.countries = [
        countriesRes.find(x => x.code === 'US'),
        countriesRes.find(x => x.code === 'CA'),
        countriesRes.find(x => x.code === 'AU'),
      ].concat(countriesRes.filter(x => x.code !== 'US' && x.code !== 'CA' && x.code !== 'AU'));

      if (this.subscription.billingAddress) {
        const selectedBillingCountry = this.countries.find(country => country.code === this.subscription.billingAddress.countryCode);
        this.billingStates = selectedBillingCountry ? selectedBillingCountry.states : null;
      }

      this.fullName = `${this.subscription.billingFirstName||''} ${this.subscription.billingLastName||''}`.trim();

      this.subscriptionOriginal = JSON.parse(JSON.stringify(this.subscription));
    } catch (err) {
      console.error(err);
    }

    this.submitSubject.subscribe(res => {
      this.updatePayment(res);
    })
  }

  public async onEditCardDetails() {
    this.canEdit = true;
    if (this.subscription.paymentGatewaySource === 'STRIPE') {
      this.showStripeElements = true;
      this.cd.detectChanges();
      await this.mountStripeCard(); 
    }
  }

  stopValidation() {
    $('input').removeClass('ng-touched');
    $('input').on('blur', function(event) {
      $(this).addClass('ng-touched');
    });
  }

  cancel() {
    this.billingAlerts = [];
    this.billingSuccessAlerts = [];
    this.stopValidation();
    this.formReset();
    this.canEdit = false;
    this.showStripeElements = false;
  }

  formReset() {
    try {
      this.subscription = this.subscriptionOriginal;
      this.subscriptionOriginal = JSON.parse(JSON.stringify(this.subscription));
    } catch (err) {
      console.error(err);
    }
  }

  private async mountStripeCard() {
    const publishableKey = await this._stripeGatewayService.getPublishableKey(this.subscription.subscriptionLevelId);
    
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

    const clientIntentRes = await this._stripeGatewayService.createClientIntent(this.subscription.subscriptionLevelId);
    this.stripeCardSetupClientSecret = clientIntentRes.client_secret;
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
        this.billingSuccessAlerts.push({
          type: 'danger',
          msg: result.error.message,
          timeout: 5000
        });
        this.stripePaymentMethodId = null;
      } else {
        this.stripePaymentMethodId = result.setupIntent.payment_method;
      }
  }

  async updatePayment(isValid) {
    if (!isValid) {
      return;
    }
    this.billingLoading = true;
    this.billingAlerts = [];
    this.billingSuccessAlerts = [];
    var card: any = {
      athleteId: this.subscription.athleteId,
      ccType: this.subscription.creditCardData.cardType,
      ccNumber: this.subscription.creditCardData.ccNumber,
      ccExpDt: this.subscription.creditCardData.expirationDate,
      ccCode: this.subscription.creditCardData.cvc,
    };

    if (this.subscription.paymentGatewaySource === 'STRIPE' && this.showStripeElements) {
      await this.confirmCardSetup();
      if (this.stripePaymentMethodId) {
        card.stripePaymentMethodId = this.stripePaymentMethodId;
      } else {
        this.billingLoading = false;
        return;
      }
    } 

    if (this.subscription.billingSameAsAccountAddr == 'true') {
      card.sameAsAccountAddress = 'true';
    } else {
      card.sameAsAccountAddress = 'false';
      card.firstName = this.subscription.billingFirstName;
      card.lastName = this.subscription.billingLastName;
      card.mainPhone = this.subscription.billingMainPhone;
      card.alternatePhone = this.subscription.billingAlternatePhone;
      card.address1 = this.subscription.billingAddress.address1;
      card.address2 = this.subscription.billingAddress.address2;
      card.city = this.subscription.billingAddress.city;
      card.state = this.subscription.billingAddress.state;
      card.country = this.subscription.billingAddress.countryCode;
      card.zip = this.subscription.billingAddress.zip;
    }
    
    this.userProfileService.updatePayment(card).subscribe(async (res) => {
      this.stopValidation();
      if (res.header.status === 'success') {
        this.responseMessage.class = 'alert-success';
        this.responseMessage.message = 'Payment details have been updated';
        this.billingSuccessAlerts.push({
          type: 'success',
          msg: 'Successfully Updated Billing Details',
          timeout: 5000
        });
        this.showUpdateForBilling = false;
        this.showUpdateForContact = false;
        this.billingLoading = false;
        this.canEdit = false;
        const subscriptionRes = await this.userProfileService.subscription().toPromise();
        this.subscription = subscriptionRes.body.response;
        this.subscriptionOriginal = JSON.parse(JSON.stringify(this.subscription));
        this.showStripeElements = false;

      } else if (res.header.status === 'error') {
        this.billingLoading = false;
        this.responseMessage.class = 'alert-danger';
        this.responseMessage.message = res.body.response.msg;
        this.billingSuccessAlerts.push({
          type: 'danger',
          msg: res.body.response.msg,
          timeout: 5000
        });
      }

      this.expirationDateError = null;
      this.updateCard.emit();
    }, (err) => {
      this.stopValidation();
      if (err.body.response.code === '18002') {
        this.router.navigate(['/login']);
      } else {
        this.billingSuccessAlerts.push({
          type: 'danger',
          msg: 'Unable to process request, please contact support.',
          timeout: 5000
        });
        this.billingLoading = false;
        this.responseMessage.class = 'alert-danger';
        this.responseMessage.message = 'Something went wrong, please check the credit card details you\'ve entered and try again';
      }

      this.expirationDateError = null;
    });
  }

  validateExpirationDateError(input, isDirty) {
    if (!isDirty) {
      return;
    }
    this.expirationDateError = null;
    if (!input) {
      return;
    }
    const SHORT_DATE_REGEX = /^(\d\d)\/(\d\d)$/;
    if (SHORT_DATE_REGEX.test(input)) {
      input = input.replace(SHORT_DATE_REGEX, '$1/20$2');
      this.subscription.creditCardData.expirationDate = input;
      this._changeDetector.detectChanges();
    }
    if (input.indexOf('/') === -1 || input.split('/').length !== 2) {
      this.expirationDateError = 'Must be in format mm/yy';
      return;
    }
    var ms = new Date(parseInt(input.split('/')[1]), parseInt(input.split('/')[0]) - 1).valueOf();
    if (ms <= new Date().valueOf()) {
      this.expirationDateError = 'Must be in future';
      return;
    }
  }

  get isCardAMEX() {
    const ccNumber = this.subscription && this.subscription.creditCardData && this.subscription.creditCardData.ccNumber;
    if(ccNumber)
      return ccNumber.length === 15 && ccNumber.charAt(0) == 3;
      else 
      return false;
  }

  onStripCardChange({ error }) {
    if (error) { 
      this.error = error.message;
    } else {
      this.error = null;
    }
    this.cd.detectChanges();
  }

  get creditCardType() {
    if (this.subscription.creditCardData.cardType == 'VI') {
      return 'Visa';
    } 
    if (this.subscription.creditCardData.cardType == 'CA') {
      return 'MasterCard';
    }
    if (this.subscription.creditCardData.cardType == 'AX') {
      return 'American Express'
    }
    if (this.subscription.creditCardData.cardType == 'DS') {
      return 'Discover'
    }
  }
}
