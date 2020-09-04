import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, AbstractControl, FormControl } from '@angular/forms';
import { UserProfileService } from '../../user-profile.service';
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm;
  oldPassword;
  responseMessage = {
    message: '',
    class: ''
  };
  password;
  password2;
  loading;
  successMessage;

  constructor(
    fb: FormBuilder,
    private userProfileService: UserProfileService,
  ) {
    this.changePasswordForm = fb.group({
      oldPassword: ['', Validators.required],
      password: ['', Validators.compose([Validators.required, x => this._validatePassword(x)])],
      password2: ['', [Validators.required, matchOtherValidator('password')]],
    });
  }

  change(oldPassword, newPassword) {
    this.userProfileService.changePassword(oldPassword, newPassword).subscribe((res) => {
      console.log(res);
      if (res.header.status == 'success') {
        this.responseMessage.message = res.body.response.confirmationMessage;
        this.responseMessage.class = 'alert-success'
      } else {
        this.responseMessage.message = "Something went wrong, please check if you've entered the correct password";
        this.responseMessage.class = 'alert-danger';
      }

    }, (err) => {
      console.log(err);
      this.responseMessage.message = "Something went wrong, please check if you've entered the correct password";
      this.responseMessage.class = 'alert-danger';
    })
  }

  ngOnInit() {
  }

  private _validatePassword({ value }: AbstractControl) {
    if (!value)  {
      return;
    }
    if (value.length < 8) {
      return { 'minlength': true };
    }
    if (!/[a-z]/.test(value)) {
      return { 'weak': true };
    }
    if (!/[0-9]/.test(value)) {
      return { 'weak': true };
    }
    if (!/[A-Z]/.test(value)) {
      return { 'weak': true };
    }
  }

}

function matchOtherValidator (otherControlName: string) {

  let thisControl: FormControl;
  let otherControl: FormControl;

  return function matchOtherValidate (control: FormControl) {

    if (!control.parent) {
      return null;
    }

    // Initializing the validator.
    if (!thisControl) {
      thisControl = control;
      otherControl = control.parent.get(otherControlName) as FormControl;
      if (!otherControl) {
        throw new Error('matchOtherValidator(): other control is not found in parent group');
      }
      otherControl.valueChanges.subscribe(() => {
        thisControl.updateValueAndValidity();
      });
    }

    if (!otherControl) {
      return null;
    }

    if (otherControl.value !== thisControl.value) {
      return {
        matchOther: true
      };
    }

    return null;

  }

}