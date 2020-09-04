import Debounce from 'debounce-decorator';

import { Component, OnInit } from '@angular/core';
import { OnboardService } from '../../onboard/onboard.service';
import { Validators, FormBuilder } from '@angular/forms';
import { LocalstorageService } from './../common-services/localstorage.service';
import { DEBOUNCE_INTERVAL_DEFAULT_MS } from '../constants/constants';

@Component({
  selector: 'app-email-verification-inline',
  templateUrl: './email-verification-inline.component.html',
  styleUrls: ['./email-verification-inline.component.scss']
})
export class EmailVerificationInlineComponent implements OnInit {
  athleteProfile;
  loading;
  errorMessage;
  successMessage;
  email;
  displayModal;
  editEmailForm;
  editMode: boolean;
  checkEmailBusy = false;
  constructor(
    fb: FormBuilder, 
    private onboardService: OnboardService,
    private localstorageService: LocalstorageService
  ) {
    this.editEmailForm = fb.group({
      email: ['', Validators.email]
    });
  }

  ngOnInit() {
    if(localStorage.athleteProfile) {
      this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
      this.email = this.athleteProfile.email;
    }
  }

  async resend(newEmail: string, isValid: boolean) {
    if (!isValid) {
      return;
    }
    this.loading = true;
    try {
      if (newEmail && this.athleteProfile.email !== newEmail) {
        await this.onboardService.changeEmail(newEmail);
      }
      const verifyResponse = await this.onboardService.resendverifyemail(newEmail).toPromise();
      if (verifyResponse.header.status === 'error') {
        this.errorMessage = verifyResponse.body.response.msg;
        this.loading = false;
      } else if (verifyResponse.header.status === 'success') {
        this.loading = false;
        this.successMessage = verifyResponse.body.response.confirmationMessage + " to "+ newEmail;
        setTimeout(() => this.successMessage = '', 10000);
      }
      this.displayModal.hide();
    } catch (err) {
      this.loading = false;
      this.errorMessage = "Something went wrong. Please try again later."
    }
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  async checkEmail(email: string, isValid: boolean) {
    if (!isValid) {
      this.editEmailForm.controls.email.setErrors({ 'email': true });
      return;
    }
    
    if (this.athleteProfile.email === email) {
      // Don't check if there's no changes
      return;
    }

    try {
      this.checkEmailBusy = true;
      await this.onboardService.emailChecker(email).toPromise();
    } catch (err) {
      this.editEmailForm.controls.email.setErrors({ 'used': true });
    } finally {
      this.checkEmailBusy = false;
    }
  }


}
