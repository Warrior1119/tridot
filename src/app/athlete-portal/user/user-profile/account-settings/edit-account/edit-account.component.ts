import Debounce from 'debounce-decorator';
import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { UserProfileService } from '../../../user-profile/user-profile.service';
import { Router } from '@angular/router';
import { GlobalService } from '../../../../common-services/global.service';
import { Country } from '../../../../common-model/country.model';
import { State } from '../../../../common-model/state.model';
import { Alert } from '../../../../common-components/alerts/alert.model';
import { OnboardService } from '../../../../../onboard/onboard.service';
import { DEBOUNCE_INTERVAL_DEFAULT_MS } from '../../../../constants/constants';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-edit-account',
  templateUrl: './edit-account.component.html',
  styleUrls: ['./edit-account.component.scss']
})
export class EditAccountComponent implements OnInit {
  
  @Input() canEdit = false;
  @Input() isMobile;
  @Output() subscriptionChange = new EventEmitter();
  @ViewChild('form') form: FormControl;

  subscription;
  subscriptionOriginal;
  showUpdateForContact;

  emailUsed = false;
  emailBusy = false;

  countries: Country[] = [];
  states: State[] = [];

  contactAlerts: Alert[] = [];

  contactLoading = false;

  originalEmail: string;

  constructor(
    private userProfileService: UserProfileService,
    private onboardService: OnboardService,
    private globalService: GlobalService,
    private router: Router,
  ) { }

  get formValid() {
    return this.form.valid;
  }

  get selectedState() {
    if (!this.subscription) {
      return;
    }
    const foundState = this.states.find(state => Object.values(state).includes(this.subscription.accountAddress.state));
    return (foundState && foundState.code) || this.subscription.accountAddress.state;
  }

  set selectedState(code: string) {
    this.subscription.accountAddress.state = code;
  }

  ngOnInit() {
    this.getSubscription();
  }

  formReset() {
    this.subscription = this.subscriptionOriginal;
    this.states = this._getStates(this.subscription.accountAddress.countryCode);

    this.subscriptionOriginal = JSON.parse(JSON.stringify(this.subscription));
  }

  async getSubscription() {
    try {
      const subscriptionRes = await this.userProfileService.subscription().toPromise();
      this.subscription = subscriptionRes.body.response;
      this.subscription.billingAddress = this.subscription.billingAddress || {};
      this.subscription.creditCardData = this.subscription.creditCardData || {};
      this.originalEmail = this.subscription.email;
      const countriesRes = await this.globalService.getCountries().toPromise();
      this.countries = [
        countriesRes.find(x => x.code === 'US'),
        countriesRes.find(x => x.code === 'CA'),
        countriesRes.find(x => x.code === 'AU'),
      ].concat(countriesRes.filter(x => x.code !== 'US' && x.code !== 'CA' && x.code !== 'AU'));

      this.states = this._getStates(this.subscription.accountAddress.countryCode);

      this.subscriptionOriginal = JSON.parse(JSON.stringify(this.subscription));
      console.log("this.subscription....", this.subscriptionOriginal);
    } catch (err) {
      console.error(err);
    }
  }

  save(isValid) {
    if (!isValid) {
      return;
    }
    this.contactLoading = true;
    this.contactAlerts = [];
    console.log('new state', this.subscription.accountAddress.state);
    this.userProfileService.updateContactInfo(this.subscription).subscribe((res) => {
      if (res.body.response.confirmationMessage) {
        this.contactAlerts.push(new Alert('success', 'Successfully Updated Contact Information'));
        this.showUpdateForContact = false;
        this.contactLoading = false;
      }
      this.subscriptionOriginal = JSON.parse(JSON.stringify(this.subscription));
      this.subscriptionChange.emit();
    }, (err) => {
      if (err.body.response.code === '18002') {
        this.router.navigate(['/login']);
      } else {
        this.contactAlerts.push(new Alert('danger'));
        this.showUpdateForContact = false;
        this.contactLoading = false;
      }
    });
  }

  onCountryCodeChanged() { 
    this.showUpdateForContact = true;
    this.states = this._getStates(this.subscription.accountAddress.countryCode);
    this.subscription.accountAddress.state = '';
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  async checkEmail(email: string, isValid: boolean) {
    if (!isValid) {
      return;
    }
    if (email === this.originalEmail) {
      this.emailUsed = false;
      return;
    }
    try {
      this.emailBusy = true;
      await this.onboardService.emailChecker(email).toPromise();
      this.emailUsed = false;
    } catch (err) {
      this.emailUsed = true;
    } finally {
      this.emailBusy = false;
    }
  }

  private _getStates(countryCode: string) {
    const selectedCountry = this.countries.find(country => country.code === countryCode);
    return selectedCountry ? selectedCountry.states : null;
  }
}
