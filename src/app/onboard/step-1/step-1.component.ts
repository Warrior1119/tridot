import { Component, OnInit, HostListener } from "@angular/core";
import { Validators, FormBuilder } from "@angular/forms";
import { OnboardService } from "../onboard.service";
import { Router } from "@angular/router";

const FULL_NAME_PATTERN = /^\S+(\s+\S+){1,2}\s*$/; // 2-3 groups of non-whitespace characters separated by whitespace

@Component({
  selector: "app-step-1",
  templateUrl: "./step-1.component.html",
  styleUrls: ["./step-1.component.scss"]
})
export class Step1Component implements OnInit {

  @HostListener('window:beforeunload', ['$event']) onBeforeUnload($event) {
    return $event.returnValue = false;
  }

  step1Form;
  name;

  userName;
  constructor(
    fb: FormBuilder,
    private onboardService: OnboardService,
    private router: Router,
  ) {
    this.step1Form = fb.group({
      name: ["", Validators.compose([Validators.required, Validators.pattern(FULL_NAME_PATTERN)])]
    });
  }

  ngOnInit() {
    if (!this.onboardService.userHasFields('email', 'password')) {
      this.router.navigate(['/onboard/sign-up']);
      return;
    }

    if (this.onboardService.user) {
      const {firstName, lastName} = this.onboardService.user;
      if (firstName && lastName) {
        this.name = `${firstName} ${lastName}`;
      }
    }
  }

  nextStep(gender, isValid) {
    // Late form validation allows the red borders appear around invalid fields.
    if (!isValid) {
      return;
    }
    this.onboardService.updateUser({
      firstName: this.name.trim().split(" ")[0],
      lastName: this.name
            .trim()
            .split(" ")
            .slice(1, 3)
            .join(" "),
      gender,
    });

    this.router.navigate(["onboard/step-2"]);
  }
}
