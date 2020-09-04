import { Component, OnInit, Input } from '@angular/core';
import { UserProfileService } from '../../user-profile.service';
import * as moment from 'moment';
import { Alert } from '../../../../common-components/alerts/alert.model';
import { ToastrService } from 'ngx-toastr';
import { LocalstorageService } from '../../../../common-services/localstorage.service';
import {BsModalRef} from "ngx-bootstrap/modal/bs-modal-ref.service";
import {BsModalService} from "ngx-bootstrap/modal";

@Component({
  selector: 'app-notification-preferences',
  templateUrl: './notification-preferences.component.html',
  styleUrls: ['./notification-preferences.component.scss']
})
export class NotificationPreferencesComponent implements OnInit {
  @Input() isMobile;
  @Input() isMobileOrTablet;

  athleteProfile: any;
  public editMode: boolean = false;
  constructor(
    private userProfileService: UserProfileService,
    private toastr: ToastrService,
    private localstorageService: LocalstorageService,
    private modalService: BsModalService,
  ) {
    this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
  }

  calendar = 'Google Calendar';
  measurementSystem = 'standard';
  b2rFactor = false;
  encryptedId = '';
  emailPrefIdTime = new Date();
  loading = false;
  public isEmailNotificationPreferred = true;
  icalURL = ''; //TRDUX-180
  modalRef: BsModalRef;

  ngOnInit() {
    if (this.athleteProfile) {
      if (this.athleteProfile.emailPrefId === -1) {
        this.isEmailNotificationPreferred = false;
      } else {
        this.isEmailNotificationPreferred = true;
        this.emailPrefIdTime.setHours(this.athleteProfile.emailPrefId);
      }
      this.emailPrefIdTime.setHours(this.athleteProfile.emailPrefId);
      this.measurementSystem = this.athleteProfile.measurementSystem;
      this.b2rFactor = this.athleteProfile.b2rFactor;
      this.encryptedId = this.athleteProfile.encryptedId;
      this.icalURL = this.athleteProfile.icalURL; //TRDUX-180
    }
  }

  cancel() {
    this.editMode = false;
  }

  createRange(number) {
    const items: number[] = [];
    for (let i = -1; i < number; i++) {
      items.push(i);
    }
    return items;
  }

  setMeasurement(measurement) {
    this.measurementSystem = measurement;
  }

  getMeasurement(measurement) {
    return measurement.charAt(0).toUpperCase() + measurement.slice(1);
  }

  setB2RFactor(factor) {
    this.b2rFactor = factor;
  }

  getB2RFactor(factor) {
    return factor ? 'ON' : 'OFF';
  }


  getICalUrl() {
    return  'webcal://' + this.icalURL; //TRDUX-180
  }

  getGoogleCalUrl() {
    return  'https://' + this.icalURL; //TRDUX-180
  }

  selectCalendar($event: any) {
    this.calendar = $event;
  }

  copyInputMessage(inputElement) {
    console.log("inputElement", inputElement);
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
  }

  onTimeChange(value: Date) {
    if (this.emailPrefIdTime === value) {
      return;
    }
    this.emailPrefIdTime = value;
    this._update();
  }

  setEmailNotificationPreferred(value: boolean) {
    if (this.isEmailNotificationPreferred === value) {
      return;
    }
    this.isEmailNotificationPreferred = value;
    // this._update();
  }

  updateNotificationPreference() {
    if (this.calendar == 'iCal') {
      let iCal = document.createElement("textarea");
      iCal.value = this.getICalUrl();
      document.body.appendChild(iCal);
      iCal.focus();
      iCal.select();
      iCal.setAttribute("style", "position: absolute;left:-9999px;");
      document.execCommand('copy');
      iCal.setSelectionRange(0, 0);
    } else {
      let google = document.createElement("textarea");
      google.value = this.getGoogleCalUrl();
      document.body.appendChild(google);
      google.focus();
      google.select();
      google.setAttribute("style", "position: absolute;left:-9999px;");
      document.execCommand('copy');
      google.setSelectionRange(0, 0);
    }
    this._update();
  }

  private _update() {
    this.loading = true;
    const profile = Object.assign({}, this.athleteProfile);
    if (this.isEmailNotificationPreferred === true && this.emailPrefIdTime) {
      profile.emailPrefId = this.emailPrefIdTime.getHours();
    } else {
      profile.emailPrefId = -1;
    }

    profile.encryptedId = this.encryptedId;
    if (profile.swimStartDate) {
      profile.swimStartDate = moment(profile.swimStartDate).format('l');
    }
    if (profile.runStartDate) {
      profile.runStartDate = moment(profile.runStartDate).format('l');
    }
    if (profile.dob) {
      profile.dob = moment(profile.dob).format('l');
    }
    if (profile.bikeStartDate) {
      profile.bikeStartDate = moment(profile.bikeStartDate).format('l');
    }
    this.userProfileService.save(profile).subscribe(res => {
      localStorage.athleteProfile = JSON.stringify(profile);
      this.athleteProfile = profile;
      if (res['header']['status'] === 'success') {
        this.toastr.success('Successfully Saved Notification Preferences');
      } else {
        this.toastr.error('Failed to Save Notification Preferences');
      }
      this.loading = false;
      this.editMode = false;
    }, error => {
      this.toastr.success('Failed to Save Notification Preferences');
      this.loading = false;
      this.editMode = false;
    });
   }
}
