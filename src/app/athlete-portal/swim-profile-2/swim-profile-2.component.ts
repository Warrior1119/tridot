import { Component, OnInit, HostListener } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { OnboardService } from '../../onboard/onboard.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ReferCoachComponent } from '../common-components/refer-coach/refer-coach.component';
import { LocalStorage } from '../common-services/local-storage';
import { LocalstorageService } from './../common-services/localstorage.service';
import { UserProfileService } from '../user/user-profile/user-profile.service';
import { SwimFormService } from '../swimform/swimform.service';

@Component({
  selector: 'app-swim-profile-2',
  templateUrl: './swim-profile-2.component.html',
  styleUrls: ['./swim-profile-2.component.scss']
})
export class SwimProfile2Component implements OnInit {

  @HostListener('window:beforeunload', ['$event']) onBeforeUnload($event) {
    if (!this.complete) return $event.returnValue = false;
  }

  swimProfileForm;
  loading;
  complete;
  errorMessage;
  profile = {
    strokeRate: '',
    swimMindSet: '',
    breathBothSides: '',
    openWaterSwim: '',
    outOfBreath: '',
    threeStrokesProficiency: '',
    fourMetersNoStop: '',
    swamInSwimTeam: '',
    swimSlowerWithPullBuoy: '',
    howDriven: '',
  };

  modalRef: BsModalRef;

  athleteProfile: any;

  get swimdot() {
    return this.localstorageService.getAthleteProfileIfExists().swimdot;
  }
  get bikedot() {
    return this.localstorageService.getAthleteProfileIfExists().bikedot;
  }
  get rundot() {
    return this.localstorageService.getAthleteProfileIfExists().rundot;
  }

  constructor(
    fb: FormBuilder,
    private modalService: BsModalService,
    private onboardService: OnboardService,
    private localStorage: LocalStorage,
    private localstorageService: LocalstorageService,
    private userProfileService: UserProfileService,
    private swimFormService: SwimFormService,
  ) {
    this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
    this.swimProfileForm = fb.group({
      strokeRate: ['', Validators.required],
      confidenceLevel: ['', Validators.required],
      howDriven: ['', Validators.required],
      radio1: ['', Validators.required],
      radio2: ['', Validators.required],
      radio3: ['', Validators.required],
      radio4: ['', Validators.required],
      radio5: ['', Validators.required],
      radio6: ['', Validators.required],
      radio7: ['', Validators.required],
    });
  }

  validateStrokeRate(strokeRate) {
    if (strokeRate) {
      if (parseInt(strokeRate, 10) < 1 || parseInt(strokeRate, 10) > 3) {
        this.swimProfileForm.controls.strokeRate.setErrors({ 'incorrect': true });
        return true;
      } else {
        return false;
      }
    }
  }

  referCoach(isValid) {
    // Late form validation allows the red borders appear around invalid fields.
    if (!isValid) {
      return;
    }
    this.modalRef = this.modalService.show(ReferCoachComponent, { backdrop: 'static' });
    this.modalRef.content.displayModal = this.modalRef;
    this.modalRef.content.decision.subscribe((res) => {
      if (res === 'skip') {
        this.continue(this.profile);
      } else {
        this.profile['referral_id'] = res;
        this.profile['coachId'] = res;
        this.continue(this.profile);
      }
    });
  }

  private continue(profile): void {
    this.loading = true;
    profile.email = this.localstorageService.getAthleteProfileIfExists().email;

    this.onboardService.saveSwim2(profile).subscribe((res) => {
      if (res.header.status === 'error') {
        this.errorMessage = res.body.response.msg;
        this.loading = false;
      } else if (res.header.status === 'success') {
        console.log(res);
        localStorage.athleteProfile = JSON.stringify(res.body.response);
        localStorage.accessToken = res.header.accessKey;
        this.localStorage.set('userType', 'athlete');
        this.onboardService.clearOnBoardSessionStorage();
        setTimeout(() => {
          this.complete = true;
          this.loading = false;
          window.location.href = window.location.origin;
        }
          , 2000);
      }
    }, (err) => {
      this.loading = false;
      this.errorMessage = err.body.response.msg;

      if (!this.errorMessage) {
        this.errorMessage = 'Sorry, Something Went Wrong';
      }
      console.log(err);
    });
  }

  async ngOnInit() {
    this.athleteProfile = await this._getAthleteProfile();
    this.swimFormService.swimForm().subscribe((res: any) => {
      if (res.header.status === 'success') {
        const swimForm = res.body.response;
        if (swimForm) {
          this.profile = {
            strokeRate: swimForm.strokeRateActual,
            swimMindSet: swimForm.swimMindSet,
            breathBothSides: swimForm.breathBothSides,
            openWaterSwim: swimForm.openWaterSwim,
            outOfBreath: swimForm.outOfBreath,
            threeStrokesProficiency: swimForm.threeStrokesProficient,
            fourMetersNoStop: swimForm.swim400MetersWithoutStopping,
            swamInSwimTeam: swimForm.swamInSwimTeam,
            swimSlowerWithPullBuoy: swimForm.swimSlowWithPullBuoy,
            howDriven: swimForm.drivenRating,
          };
        }
      }
    });    
  }

  private async _getAthleteProfile() {
    try {
      const res = await this.userProfileService.profile().toPromise();
      return res.body.response.athleteProfile;
    } catch (err) {
      console.error(err);
      return {};
    }
  }

}
