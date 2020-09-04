import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '../user-profile/user-profile.service'
import { ConfirmationModalComponent } from '../../common-components/confirmation-modal/confirmation-modal.component';
import { MessageModalComponent } from '../../common-components/message-modal/message-modal.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalstorageService } from './../../common-services/localstorage.service';
import { CommonUtils } from '../../common-util/common-utils';
import { STATE_23 } from '../../../routes/genetics/connect.page';
import { LocalStorage } from '../../common-services/local-storage';
import { PLACEHOLDER_DD_MM_YYYY } from '../../constants/date-time.constants';
import { getWindowWidth } from '../../../utils/browser';
import { MOBILE_WIDTH_THRESHOLD, TABLET_WIDTH_THRESHOLD } from '../../constants/constants';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit {
  private POLAR_ADD = 'polarAdd';
  private STRAVA_ADD = 'stravaAdd';
  private GARMIN_ADD = 'garminAdd';
  private GARMIN_TRAINING_ADD = 'garminTrainingAdd';
  private Garmin_HEALTH_ADD = 'garminHealthAdd';

  profile: any;
  devices = {
    strava: null,
    garmin: null,
    garmintraining: null,
    polar: null,
    garminhealth: null,
    twentythreeandme: null,
  };
  modalRef: BsModalRef;
  showFirstDeviceConnectedMessage = false;
  
  get isMobile() {
    return getWindowWidth(window) < MOBILE_WIDTH_THRESHOLD;
  }

  get isMobileOrTablet() {
    return getWindowWidth(window) < TABLET_WIDTH_THRESHOLD;
  }

  get deviceAddedFirstTime() {
    return this.localStorage.get('device-added-first-time', false);
  }

  set deviceAddedFirstTime(value: boolean) {
    this.localStorage.set('device-added-first-time', value);
  }

  get prefDateTimeFormat() {
    return this.profile && this.profile.prefDateFormat === PLACEHOLDER_DD_MM_YYYY
      ? 'DD.MM.YYYY HH:mm'
      : 'MM.DD.YYYY HH:mm';
  }
  
  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private userProfileService: UserProfileService,
    private router: Router,
    private localStorage: LocalStorage,
    private localstorageService: LocalstorageService,
  ) {
    this.profile = this.localstorageService.getAthleteProfileIfExists();
    this.route.queryParams.subscribe((res) => {
      if (res.state === STATE_23) {
        const { state, code, error, error_description } = res;
        this.router.navigate(['/genetics/connect'], { queryParams: { state, code, error, error_description } });
      }
      console.log(res);
      //TRDUX-249 Assuming oauth token is not present in strava and polar so this is fine, else we should 
      //add a check for res.state=garminAdd here
      if (res.oauth_token && res.oauth_verifier) {
        var url =this.router.url;
        var splitted = url.split("/", 4);
          if(splitted[3] != undefined) {
            var deviceId = splitted[3].split("?",1)[0];
            if(deviceId == '5') {
              console.log('garmin health is called');
              this.addGarminHealthEnd(res.oauth_token, res.oauth_verifier);
            }
            else if(deviceId == '8') {
              this.addGarminTrainingEnd(res.oauth_token, res.oauth_verifier);
            }
          }
          else{
            this.addGarminEnd(res.oauth_token, res.oauth_verifier);
          }  
      }

      if (res.code) {
        if (res.state == this.STRAVA_ADD) {
          this.addStravaEnd(res.code);
        }
        else if (res.state == this.POLAR_ADD) {
          this.addPolarEnd(res.code);
        }
      }

    })
  }

  get noConnectedDevice() {
    return this.profile && this.profile.connectedDevice == 0;
  }

  getProfile() {
    this.userProfileService.profile().subscribe((res) => {
      this.profile = res.body.response.athleteProfile;
    })
  }
  addGarminHealthStart() {
    this.userProfileService.addDeviceStart(5).subscribe((res) => {
      let protocol = window.location.protocol;
      let host = window.location.host
      let state = "&state="+this.Garmin_HEALTH_ADD;
      var callBackUrl = 'http://connect.garmin.com/oauthConfirm?oauth_callback=' + protocol + "//" + host + '/user/devices/5' + state + '&oauth_token=';
      var buildUrl = callBackUrl + res.unauthorizedToken;
      localStorage.unauthorizedTokenSecret = res.unauthorizedTokenSecret;
      this.openInNewTab(buildUrl);
    })
  }
  async addGarminHealthEnd(token, verifier) {
    const res = await this.userProfileService.addDeviceWithVerifierEnd(token, verifier,5).toPromise();
    console.log(res);
    this.showDeviceAddMessage(res)
    this.getDevices();
  }
  addGarminTrainingStart() {
    this.userProfileService.addDeviceStart(8).subscribe((res) => {
      let protocol = window.location.protocol;
      let host = window.location.host
      let state = "&state="+this.GARMIN_TRAINING_ADD;
      var callBackUrl = 'http://connect.garmin.com/oauthConfirm?oauth_callback=' + protocol + "//" + host + '/user/devices/8' + state + '&oauth_token=';
      var buildUrl = callBackUrl + res.unauthorizedToken;
      localStorage.unauthorizedTokenSecret = res.unauthorizedTokenSecret;
      this.openInNewTab(buildUrl);
    })
  }
  async addGarminTrainingEnd(token, verifier) {
    const res = await this.userProfileService.addDeviceWithVerifierEnd(token, verifier,8).toPromise();
    console.log(res);
    this.showDeviceAddMessage(res)
    this.getDevices();
  }
 
  getGarminConnectClass(){
    if(this.devices.garmin && !this.devices.garminhealth && !this.devices.garmintraining){
      return {'health-active-card': this.devices.garmin};    
    }else
    return {'active-card': this.devices.garmin}
  }
  getDevices() {
    this.userProfileService.getDevices().subscribe(res => {
      if (res.header.status == 'success') {
        this.devices = {
          strava: null,
          garmin: null,
          garmintraining: null,
          polar: null,
          garminhealth: null,
          twentythreeandme: null,
        };
        if (res.body.response.length) {
          res.body.response.forEach(device => {
            this.devices[device.vendor.name.toLowerCase()] = device;
          });
        } else {
          this.deviceAddedFirstTime = true;
        }
      }
    })
  }

  openInNewTab(url) {
    var win = window.open(url, '_blank');
    if (win == null || typeof(win)=='undefined') {  
      CommonUtils.modalMessage('Pop-up Blocked','Please disable your pop-up blocker and try again.', this.modalRef, 'error', this.modalService, 'DISMISS');
  } else{
    win.focus();
  }
  }

  disconectDevice(id) {
    this.userProfileService.disconnectDevice(id).subscribe((res) => {
      console.log(res);
      setTimeout(() => this.getDevices(), 500)
    })
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  async addPolarStart() {
    this.userProfileService.addPolarStart().subscribe((res) => {


      let state = this.POLAR_ADD;
      var buildUrl = res.polarUrl;

      this.openInNewTab(buildUrl);

    })
  }

  showDeviceAddMessage(res) {

    this.modalRef = this.modalService.show(MessageModalComponent);
    this.modalRef.content.displayModal = this.modalRef;
    const success = this.modalRef.content.parseAndSetBackendResponse(res);

    this.modalRef.content.confirmation.subscribe((decision) => {
      if (success) {
        if (this.deviceAddedFirstTime) {
          this.showFirstDeviceConnectedMessage = true;
          this.deviceAddedFirstTime = false;
        }
      }
    });
    
  }
  async addPolarEnd(code) {
    const res = await this.userProfileService.addPolarEnd(code).toPromise();
    this.showDeviceAddMessage(res)
    this.getDevices();
  }


  async addGarminEnd(token, verifier) {
    const res = await this.userProfileService.addGarminEnd(token, verifier).toPromise();
    console.log("garmin result" + JSON.stringify(res));
    this.showDeviceAddMessage(res)
    this.getDevices();
  }
  

  async addStravaEnd(code) {
    const res = await this.userProfileService.addStravaEnd(code).toPromise();
    console.log("Strava response" + JSON.stringify(res));
    this.showDeviceAddMessage(res)
    this.getDevices();
  }

  addGarminStart() {
    this.userProfileService.addGarminStart().subscribe((res) => {
      let protocol = window.location.protocol;
      let host = window.location.host
      let state = "&state="+this.GARMIN_ADD;
      var baseUrl = 'http://connect.garmin.com/oauthConfirm?oauth_callback=' + protocol + "//" + host + '/user/devices' + state + '&oauth_token=';
      var buildUrl = baseUrl + res.body.unauthorizedToken;
      localStorage.unauthorizedTokenSecret = res.body.unauthorizedTokenSecret;
      this.openInNewTab(buildUrl);
    })
  }
  

  addStravaStart() {
    this.userProfileService.addStravaStart().subscribe((res) => {

      let redirect_uri = window.location.origin + "/user/devices";
      let response_type = "code";
      let approval_prompt = "auto";
      let scope = "activity:read_all,profile:read_all";
      let state = this.STRAVA_ADD;
      var buildUrl = res.stravaUrl + "?client_id=" + res.client_id
        + "&response_type=" + response_type + "&approval_prompt=" + approval_prompt +
        "&scope=" + scope + "&state=" + state + "&redirect_uri=" + redirect_uri;

      this.openInNewTab(buildUrl);

    })
  }

  connect(device) {
    if (device == 'Strava') {
      this.addStravaStart();
    } else if (device == 'Garmin') {
      this.addGarminStart();
    } else if (device == 'Polar') {
      this.addPolarStart();
    } else if(device == 'GarminHealth'){
      this.addGarminHealthStart();
    } else if(device == 'GarminTraining'){
      this.addGarminTrainingStart();
    }
  }

  disconnect(device) {
    this.modalRef = this.modalService.show(ConfirmationModalComponent);
    this.modalRef.content.message = 'Are you sure you want to disconnect ' + device.vendor.name + "? ";
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.confirmation.subscribe((decision) => {
      if (decision == true) {
       
        this.disconectDevice(device.vendor.id)
      }
    });
  }

  ngOnInit() {
    this.getDevices();
    this.getProfile();
  }

  async dontHaveDevice() {
    await this.userProfileService.dontHaveDevice(this.profile.athleteId);
    this.profile.athleteDoNotHaveDevice = true;
    localStorage.athleteProfile = JSON.stringify(this.profile);
    this.router.navigate(['/']);
  }

}
