import { Component, Output, ViewChild, EventEmitter, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { UserProfileService } from '../../../user-profile/user-profile.service';
import { Country } from '../../../../common-model/country.model';
import { State } from '../../../../common-model/state.model';
import { GlobalService } from '../../../../common-services/global.service';
import { BehaviorSubject } from 'rxjs';
declare var $:any;
@Component({
  selector: 'app-billing-address',
  templateUrl: './billing-address.component.html',
  styleUrls: ['./billing-address.component.scss']
})
export class BillingAddressComponent implements OnInit {
  
  @Input() subscription = {billingAddress:{}} as any;
  @Input() isMobile;
  @ViewChild('form') form: FormControl;
  submitSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  
  canEdit = false;
  sameAsAccount = false;
  countries: Country[] = [];
  billingStates: State[] = [];
  subscriptionOriginal;
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

  constructor(
    private userProfileService: UserProfileService,
    private globalService: GlobalService,
    private router: Router,
  ) { }

  async ngOnInit() {
    try {
      const countriesRes = await this.globalService.getCountries().toPromise();
      this.countries = [
        countriesRes.find(x => x.code === 'US'),
        countriesRes.find(x => x.code === 'CA'),
        countriesRes.find(x => x.code === 'AU'),
      ].concat(countriesRes.filter(x => x.code !== 'US' && x.code !== 'CA' && x.code !== 'AU'));

      const selectedBillingCountry = this.countries.find(country => country.code === this.subscription.billingAddress.countryCode);
      this.billingStates = selectedBillingCountry ? selectedBillingCountry.states : null;

      this.subscriptionOriginal = JSON.parse(JSON.stringify(this.subscription));

      if (this.subscription.billingSameAsAccountAddr == 'true') {
        this.sameAsAccount = true;
        this.adjustAddresses(true);
      } else {
        this.sameAsAccount = this._getBillingSameAsAccountAddr();
      }

    } catch (err) {
      console.error(err);
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

  stopValidation() {
    $('input').removeClass('ng-touched');
    $('input').on('blur', function(event) {
      $(this).addClass('ng-touched');
    });
  }

  edit() {
    this.canEdit = true;
    this.sameAsAccount = this._getBillingSameAsAccountAddr();
  }

  cancel() {
    this.billingAlerts = [];
    this.billingSuccessAlerts = [];
    this.stopValidation();
    this.formReset();
    this.canEdit = false;
  }

  formReset() {
    try {
      this.subscription = this.subscriptionOriginal;
      this.billingStates = this._getBillingStates(this.subscription.billingAddress.countryCode);

      this.subscriptionOriginal = JSON.parse(JSON.stringify(this.subscription));
    } catch (err) {
      console.error(err);
    }
  }

  async updatePayment(isValid) {
    this.submitSubject.next(isValid);

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
      ccCode: this.subscription.creditCardData.cvc
    };

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

      } else if (res.header.status === 'error') {
        this.billingLoading = false;
        this.responseMessage.class = 'alert-danger';
        this.responseMessage.message = res.body.response.msg;
      }

      this.expirationDateError = null;

    }, (err) => {
      this.stopValidation();
      if (err.body.response.code === '18002') {
        this.router.navigate(['/login']);
      } else {
        this.billingAlerts.push({
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

  adjustAddresses(bool) {
    if (bool) {
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
  }

  onCountryCodeChanged() {
    this.showUpdateForBilling = true;
    this.billingStates = this._getBillingStates(this.subscription.billingAddress.countryCode);
    this.subscription.billingAddress.state = '';
  }

  private _getBillingStates(countryCode: string) {
    const selectedCountry = this.countries.find(country => country.code === countryCode);
    return selectedCountry ? selectedCountry.states : null;
  }

  private _getBillingSameAsAccountAddr() {
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
}
