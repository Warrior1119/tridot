import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OnboardService } from '../onboard.service';

@Component({
  selector: 'app-email-confirm',
  templateUrl: './email-confirm.component.html',
  styleUrls: ['./email-confirm.component.scss']
})
export class EmailConfirmComponent implements OnInit {
  message = {
    text: 'Email Verified!',
    subtext: 'You may now login',
    type: 'text-success',
    responseType: 'success'
  }

  emailSent = {
    message: '',
    type: ''
  }

  email;

  constructor(private onboardService: OnboardService, private route: ActivatedRoute) {

    this.route.queryParams.subscribe((res) => {
      console.log(res.email);
      console.log(res.token);
      this.email = res.email;
      this.confirm(res.token);
    })
  }

  confirm(token) {
    this.onboardService.confirmEmail(token).subscribe(res => {
      console.log(res);
    }, (err) => {
      this.message.text = err.body.response.msg;
      this.message.type = "text-danger";
      this.message.subtext = "Sorry, something went wrong",
        this.message.responseType = 'error';
    })
  }

  resend() {
    this.onboardService.resendverifyemail(this.email).subscribe((res) => {
      console.log(res);

      if (res.header.status == 'error') {
        this.emailSent.message = "Sorry, something went wrong, please try to resend again";
        this.emailSent.type = "text-danger";
      } else if (res.header.status == 'success') {
        this.emailSent.message = "Sent!";
        this.emailSent.type = "text-success"
      }

    }, (err) => {
      console.log(err)
    })
  }



  ngOnInit() {
  }

}
