import Debounce from 'debounce-decorator';

import { Component, OnInit,TemplateRef } from '@angular/core';
import { OnboardService } from '../../onboard/onboard.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Validators, FormBuilder } from '@angular/forms';
import { LocalstorageService } from './../common-services/localstorage.service';
import { DEBOUNCE_INTERVAL_DEFAULT_MS } from '../constants/constants';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss']
})
export class EmailVerificationComponent implements OnInit {

  athleteProfile;
  loading;
  errorMessage;
  successMessage;
  email;
  modalRef;
  editEmailForm;
  checkEmailBusy = false;

  constructor(
    fb: FormBuilder,
    private onboardService: OnboardService,
    private modalService: BsModalService,
    private localstorageService: LocalstorageService,
  ) {
    this.editEmailForm = fb.group({
      email: ['', Validators.email]
    });
  }

   async resend(newEmail: string) {
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
      this.modalRef.hide();
    } catch (err) {
      this.loading = false;
      console.log(err);
      this.errorMessage = "Something went wrong. Please try again later."
    }
  }

  editEmail(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
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

  ngOnInit() {
    if(localStorage.athleteProfile) {
      this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
      this.email = this.athleteProfile.email;
    }
  }

}
