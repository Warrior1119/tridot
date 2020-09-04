import { Component, OnInit } from '@angular/core';
import { permissionsSidebarHeader } from '../../../../constants/constants';
import { UserProfileService } from '../../user-profile.service';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { LocalstorageService } from './../../../../common-services/localstorage.service';
import { WeeklySummaryService } from '../../../../season-planner/training-phase/weekly-summary/weekly-summary.service';
import { ActivatedRoute } from '@angular/router';
import { MessageModalComponent } from '../../../../common-components/message-modal/message-modal.component';
import { CommonUtils } from '../../../../common-util/common-utils';

@Component({
  selector: 'app-daily-metric-tracking',
  templateUrl: './daily-metric-tracking.component.html',
  styleUrls: ['./daily-metric-tracking.component.scss']
})
export class DailyMetricTrackingComponent implements OnInit {

  deviceAddedFirstTime = false;
  healthCheck = true;
  active = {};
  modalRef: BsModalRef;
  selectedMetrics = [];
  allMetrics: any;
  athleteProfile: any;
  headers = permissionsSidebarHeader;
  devices = {
    strava: null,
    garmin: null,
    polar: null,
    garminhealth: null
  };
  selectedGarminHealthMetrics = [];
  garminHealthMetrics;
  metricsDisplayed = [];
  loading = false;
  constructor(
    private userProfileService: UserProfileService,
    private localstorageService: LocalstorageService,
    private weeklyService: WeeklySummaryService,
    private route: ActivatedRoute,
    private modalService: BsModalService,

  ) {
    this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
    this.route.queryParams.subscribe((res) => {
      //TRDUX-249 Assuming oauth token is not present in strava and polar so this is fine, else we should 
      //add a check for res.state=garminAdd here
      if (res.oauth_token && res.oauth_verifier) {



        console.log('garmin health is called');
        this.addGarminHealthEnd(res.oauth_token, res.oauth_verifier)


      }



    })
  }

  goBack() {
    window.history.back();
  }

  async ngOnInit() {
    await this.getDevices();
    await this._getMetrics();

  }

  openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
  }
  addGarminHealthStart() {
    this.userProfileService.addDeviceStart(5).subscribe((res) => {
      let protocol = window.location.protocol;
      let host = window.location.host
      let state = "&state=garminHealthAdd";
      var callBackUrl = 'http://connect.garmin.com/oauthConfirm?oauth_callback=' + protocol + "//" + host + '/user/user-profile/permissions/daily-metric-tracking' + state + '&oauth_token=';
      var buildUrl = callBackUrl + res.unauthorizedToken;
      localStorage.unauthorizedTokenSecret = res.unauthorizedTokenSecret;
      this.openInNewTab(buildUrl);
    })
  }
  async addGarminHealthEnd(token, verifier) {
    const res = await this.userProfileService.addDeviceWithVerifierEnd(token, verifier, 5).toPromise();
    this.showDeviceAddMessage(res)
    this._checkDeviceAddedFirstTime();
    this.getDevices();
  }
  showDeviceAddMessage(res) {

    this.modalRef = this.modalService.show(MessageModalComponent);
    this.modalRef.content.displayModal = this.modalRef;
    this.modalRef.content.parseAndSetBackendResponse(res);

    this.modalRef.content.confirmation.subscribe((decision) => {

    });

  }
  private _checkDeviceAddedFirstTime() {
    if (!this.athleteProfile.deviceConnected) {
      this.deviceAddedFirstTime = true;
    }
  }
  getDevices() {
    this.userProfileService.getDevices().subscribe(res => {
      if (res.header.status == 'success') {
        this.devices = {
          strava: null,
          garmin: null,
          polar: null,
          garminhealth: null
        };
        if (res.body.response.length > 0) {
          res.body.response.forEach(device => {
            this.devices[device.vendor.name.toLowerCase()] = device;
          });
        }

      }
    })
  }
  clearGarminHealthMetrics() {
    this.selectedGarminHealthMetrics = [];
  }
  clearSelectedMetrics() {
    this.selectedMetrics = [];
  }
  editTrackableGarminMetric(metricId) {
    if (!this.selectedGarminHealthMetrics.includes(metricId)) {
      this.selectedGarminHealthMetrics.push(metricId);
    }
    else {
      this.selectedGarminHealthMetrics = this.selectedGarminHealthMetrics.filter(
        t_metric => t_metric !== metricId);
    }
  }
  editTrackableMetric(metricId) {

    if (!this.selectedMetrics.includes(metricId)) {
      this.selectedMetrics.push(metricId)
    }
    else {
      this.selectedMetrics = this.selectedMetrics.filter(
        t_metric => t_metric !== metricId);
    }

  }
  async saveMetric() {
    this.loading=true;
    const selectedMetricsList = this.selectedMetrics.concat(this.selectedGarminHealthMetrics);
    const selectedMetricsSet = Array.from(new Set(selectedMetricsList));
    //let ref = CommonUtils.modalMessage('Saving Metrics', 'Please wait while we save the metrics and update your daily metric page.', this.modalRef, 'loading', this.modalService, null);
    let formatedJson = { "phaseId": null, "raceId": null, "sessionId": null, "metrics": null, "trackList": selectedMetricsSet, "displayList": this.metricsDisplayed, "metricsDate": null, "notes": null }
    try {
      await this.weeklyService.saveMetrics(formatedJson);
     // ref.modalRef.hide();
     this.loading = false;
     let ref = CommonUtils.modalMessage('Metrics Saved', "", this.modalRef, 'success', this.modalService, 'noButton');
     setTimeout(() => {
       ref.modalRef.hide();
     }, 2000);
    } catch (err) {
      // ref.modalRef.hide();
      this.loading = false;
      CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg ||'Something went wrong while saving metrics', this.modalRef, 'error', this.modalService, 'DISMISS');
      console.error(err);
    }
  }
  private async _getMetrics() {
    try {
      this.allMetrics = await this.weeklyService.getConnectedMetrics();
      this.garminHealthMetrics = this.allMetrics['Garmin Health'];
      this.allMetrics.Manual.forEach(metric => {
        if (metric.tracked) {
          this.selectedMetrics.push(metric.metricId);
        }
        if (metric.displayed) {
          this.metricsDisplayed.push(metric.metricId)
        }
      });
      this.allMetrics['Garmin Health'].forEach(metric => {
        if (metric.tracked) {
          this.selectedGarminHealthMetrics.push(metric.metricId)
        }
        if (metric.displayed) {
          this.metricsDisplayed.push(metric.metricId)
        }
      })
    } catch (err) {
      console.log(err);
      CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg ||'Something went wrong', this.modalRef, 'error', this.modalService, 'DISMISS');
    }
  }




}
