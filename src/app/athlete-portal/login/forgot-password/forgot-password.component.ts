import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormBuilder } from '@angular/forms';
import { OnboardService } from '../../../onboard/onboard.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm;
  loading;
  email;
  successMessage;
  errorMessage;
  constructor(private fb: FormBuilder, private onboardService: OnboardService,private router: Router) {
    this.forgotPasswordForm = fb.group({
      email: ['', Validators.email]
    });
  }

  forgotPassword(email) {
    this.loading = true;
    this.onboardService.resetPassword(email).subscribe((res) => {
      console.log(res);
      if (res.header.status === 'error') {
        this.errorMessage = res.body.response.msg;
        this.loading = false;
      } else if (res.header.status === 'success') {
        this.loading = false;
        this.router.navigate(['/email-sent']);
      }

    }, (err) => {
      this.loading = false;
      console.log(err);
      this.errorMessage = 'Something went wrong. Please try again later.';
    });
  }

  ngOnInit() {
    if (document.getElementById('mobile-nav')) {
      document.getElementById('mobile-nav').style.cssText = 'display:none !important';
    }
  }

}
