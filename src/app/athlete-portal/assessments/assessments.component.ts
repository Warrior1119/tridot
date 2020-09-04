import * as moment from 'moment';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AssessmentsService } from './assessments.service';
import { BsDatepickerConfig, BsDaterangepickerDirective } from 'ngx-bootstrap/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { swim_course, bike_ass_type, run_ass_type, KM_TO_MI_MULT } from '../constants/constants';
import { environment } from '../../../environments/environment';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ConfirmationModalComponent } from '../common-components/confirmation-modal/confirmation-modal.component';
import { BS_DATEPICKER_DEFAULTS } from './../constants/constants';
import { DashboardServiceService } from '../common-services/dashboard-service.service';
import { CommonTimeUtils } from '../common-util/common-time-utils';
import { AssessmentModalComponent } from './assessment-modal/assessment-modal.component';
import { UserProfileService } from '../user/user-profile/user-profile.service';
import { LocalstorageService } from './../common-services/localstorage.service';
import { BrowserScrollService } from '../../utils/browser-scroll-service';
import { TextEncodeDecode } from '../common-model/textEncodeDecode.modal';
import { DEFAULT_PREF_DATE_PATTERN } from '../constants/date-time.constants';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.scss']
})
export class AssessmentsComponent implements OnInit {

  position;
  selectedSession;
  pastAssessments;
  reversePastAssessments;
  assessmentIndex = 0;
  selectedAssessment;
  assessmentDate;
  weather;
  swim_course = swim_course;
  bike_ass_type = bike_ass_type;
  run_ass_type = run_ass_type;
  endpoint = environment.API_ENDPOINT;
  profile;
  editCourse;
  modalRef: BsModalRef;
  editassessmentType;
  readOnly = true;
  editing = false;
  creating = false;
  editRunAssType;
  showCongratulations;
  maxDate = new Date();
  athleteProfile;
  bsConfig: Partial<BsDatepickerConfig> = Object.assign({}, BS_DATEPICKER_DEFAULTS);
  error = {};
  accountAddress;
  newlyGeneratedId;

  @ViewChild('dpRun') runDatePicker: BsDaterangepickerDirective;

  constructor(
    private modalService: BsModalService,
    private dashboardService: DashboardServiceService,
    private assesmentService: AssessmentsService,
    private route: ActivatedRoute,
    private router: Router,
    private userProfileService: UserProfileService,
    private localstorageService: LocalstorageService,
    private browserScrollService: BrowserScrollService,
    public textEncodeDecode: TextEncodeDecode,
  ) {
    this.profile = this.localstorageService.getAthleteProfileIfExists();
  }

  get prefDateFormat() {
    return this.profile && this.profile.prefDateFormat || DEFAULT_PREF_DATE_PATTERN;
  }

  openAssessmentModal(assessment) {
    const initialState = {
      assessment: assessment && {...assessment},
      sessionType: this.selectedSession,
      pastAssessments: this.pastAssessments,
    };
    this.modalRef = this.modalService.show(AssessmentModalComponent, {
      class: 'modal-lg', initialState, backdrop: false,
      ignoreBackdropClick: true });
    this.modalRef.content.displayModal = this.modalRef;
    this.modalRef.content.assessmentChange.subscribe(async newlyGeneratedId => {
      this.newlyGeneratedId = newlyGeneratedId;
      this.getPastAssessments(this.selectedSession);
      await this.userProfileService.profile().toPromise();
    });
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(({sessionType}) => {
      this.selectedSession = sessionType || 'swim';
      this.getPastAssessments(this.selectedSession);
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.position = position;
        },
        (err) => {
          console.log(err);
        },
        {timeout:10000}
      );
    }

    this.accountAddress = await this._getAccountAddress();
  }

  async getPastAssessments(sessionType: string) {
    try {
      this.pastAssessments = await this.assesmentService.getPastAssessments(sessionType);
      if (!this.pastAssessments.length) {
        this.selectedAssessment = {};
        return;
      }

      this.pastAssessments.forEach((assessment) => {
        assessment.css400  = CommonTimeUtils.removeHours(assessment.css400);
        assessment.css200  = CommonTimeUtils.removeHours(assessment.css200);
        if (assessment.thresholdPace && !assessment.thresholdPaceKm) {
          // fallback to UI unit conversion
          const ms = moment.duration({minutes: assessment.thresholdPace.split(':')[0], seconds: assessment.thresholdPace.split(':')[1]}).asMilliseconds();
          assessment.thresholdPaceKm = moment.utc(ms * KM_TO_MI_MULT).format('mm:ss')
        }
      });
      this.pastAssessments = this.pastAssessments.sort((first, second) => {
        const firstDate = moment(first.assessmentDate)
          .set('hour', moment(first.trainAssessTime, 'hh:mma').hour())
          .set('minute', moment(first.trainAssessTime, 'hh:mma').minute())
          .toDate().getTime();
        const secondDate = moment(second.assessmentDate)
          .set('hour', moment(second.trainAssessTime, 'hh:mma').hour())
          .set('minute', moment(second.trainAssessTime, 'hh:mma').minute())
          .toDate().getTime();
        return firstDate > secondDate ? 1 : -1;
      });
      this.reversePastAssessments = this.pastAssessments.slice().reverse();
      if (this.newlyGeneratedId) {
        for (let i = 0; i < this.pastAssessments.length; i++) {
          if (this.pastAssessments[i].id == this.newlyGeneratedId) {
            this.assessmentIndex = i;
            break;
          }
        }
        this.newlyGeneratedId = null;
      } else {
        this.assessmentIndex = this.pastAssessments.length - 1;
      }
      this.selectedAssessment = this.pastAssessments[this.assessmentIndex];
      this._filterSelectedAssessment();

    } catch (err) {
      console.error(err);
    }
    this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();;
    // athleteProfile.bikeFtp=this.selectedAssessment.powerEnv;
    this.athleteProfile.bikeFtp=this.selectedAssessment.powerEnv!=0 ? this.selectedAssessment.powerEnv : this.athleteProfile.powerEnv;
    localStorage.setItem('athleteProfile',JSON.stringify(this.athleteProfile));
    this.setProfile(this.athleteProfile);
  }

  getNameBike(id) {
    let returnval = '';
    if (!id) {
      returnval = 'Select';
    }
    for (let i = 0; i < bike_ass_type.length; i++) {
      if (id === bike_ass_type[i].id) {
        returnval = bike_ass_type[i].name;
      }
    }
    return returnval;
  }

  getNameSwim(id) {
    let returnval = '';
    if (!id) {
      returnval = '';
    }
    for (let i = 0; i < swim_course.length; i++) {
      if (id === swim_course[i].id) {
        returnval = swim_course[i].abbr;
      }
    }
    return returnval;
  }

  changeTab(sessionType) {
    if (!this.editing && !this.creating) {
      this.router.navigate(['/assessments'], { queryParams: { sessionType: sessionType } });
    }
  }

  setProfile(profile) {
    this.profile = profile;
    if (!this.profile.assessmentChecked) {
      this.showCongratulations = true;
      this._enableAssessment();
    }
  }

  deleteAssessment() {
    this.modalRef = this.modalService.show(ConfirmationModalComponent);
    this.modalRef.content.message = 'Are you sure you want to delete this assessment?';
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.confirmation.subscribe((decision) => {
      if (decision == true) {
        this.assesmentService.deleteAssessment(this.selectedSession, this.selectedAssessment).subscribe(async (res) => {
          this.editing = false;
          this.creating = false;
          this.readOnly = true;
          if (this.assessmentIndex >= this.pastAssessments.length - 1) {
            this.newlyGeneratedId = this.pastAssessments[this.assessmentIndex - 1].id;
          } else {
            this.newlyGeneratedId = this.pastAssessments[this.assessmentIndex + 1].id;
          }
          this.getPastAssessments(this.selectedSession);
          await this.userProfileService.profile().toPromise();
        }, err => {
          console.log(err);
        });
      }
    });
  }

  onBlur() {
  }

  onDblClick() {
  }

  onDateChange(event) {
    this.selectedAssessment.assessmentDate = moment(event, this.prefDateFormat).format(DEFAULT_PREF_DATE_PATTERN);
  }

  goPrev() {
    this.readOnly = true;
    this.creating = false;
    this.editing = false;
    this.assessmentIndex = this.assessmentIndex - 1;
    this.selectedAssessment = this.pastAssessments[this.assessmentIndex];
    this._filterSelectedAssessment();
  }

  goNext() {
    this.readOnly = true;
    this.creating = false;
    this.editing = false;
    this.assessmentIndex = this.assessmentIndex + 1;
    this.selectedAssessment = this.pastAssessments[this.assessmentIndex];
    this._filterSelectedAssessment();
  }

  getBikeName() {
    if (this.profile.bikes) {
      const filtered = this.profile.bikes.filter(bike => bike.bikeId === this.selectedAssessment.bikeId);
      if (filtered.length > 0) {
        return filtered[0].nickName;
      } else {
        return '';
      }
    }
  }

  assessmentDateChanged(date) {
    this.selectedAssessment.assessmentDate = moment(date).toDate().toISOString();
  }

  formatDate(date) {
    if (!date) {
      return '';
    }
    return moment(date).format(this.prefDateFormat.replace('YYYY', 'YY'));
  }

  formatTime(time) {
    if (!time) {
      return '';
    }

    const str = time.replace(/^(?:00:)?0?/, '');
    return str;
  }

  selectBikeAssessment(id) {
    this.selectedAssessment.assessmentType = id;
    this.editassessmentType = false;
    if (id === '8mp') {
      this.selectedAssessment.assessmentTime = '00:08:00';
    } else if (id === '20mp') {
      this.selectedAssessment.assessmentTime = '00:20:00';
    }
  }

  changeSelectedAssessment(assessment) {
    this.selectedAssessment = assessment;
    this.assessmentIndex = this.pastAssessments.indexOf(this.selectedAssessment);
  }

  getCourseName() {
    switch (this.selectedAssessment.courseType) {
      default:
        return 'SC Yards';
      case 'scm':
        return 'SC Meters';
      case 'lcm':
        return 'LC Meters';
    }
  }

  getRoundValue(value) {
    if (value) {
      return Math.round(parseFloat(value));
    } else {
      return 0;
    }
  }

  getBikeAssessmentTypeName(type) {
    switch (type) {
      case 'tt_25k': return '25k';
      case 'tt_15m': return '15-mile';
      case '8mp': return '8min Power';
      case '20mp': return '20min Power';
      default: return '';
    }
  }

  getRunAssessmentTypeName(type) {
    switch (type) {
      case 'tt_5k': return '5k Time Trial';
      case 'tt_10k': return '10k Time Trial';
      default: return '';
    }
  }

  getRunAssessmentSmallTypeName(type) {
    switch (type) {
      case 'tt_5k': return '5k';
      case 'tt_10k': return '10k';
      default: return '';
    }
  }

  getWeightUnit() {
    if (this.profile) {
      if (this.profile.measurementSystem === 'standard') {
        return 'lbs';
      } else {
        return 'kg';
      }
    } else {
      return 'lbs';
    }
  }

  getLengthUnit() {
    if (this.profile) {
      if (this.profile.measurementSystem === 'standard') {
        return 'ft';
      } else {
        return 'm';
      }
    } else {
      return 'ft';
    }
  }

  compare(first, second) {

    // Time: true => Red Up Arrow, false: Green Down Arrow
    // Value: true => Green Up Arrow, false: Red Down Arrow
    if (first.indexOf(':') > -1) {
      const firstTime = moment(first, 'HH:mm:ss');
      const secondTime = moment(second, 'HH:mm:ss');
      return firstTime.isAfter(secondTime);
    } else {
      return parseInt(first) > parseInt(second);
    }
  }

  getBikeEnvTitle() {
    if (this.profile) {
      if (this.profile.measurementSystem === 'standard') {
        return 'TIME (15 mile)';
      } else {
        return 'TIME (25k)';
      }
    }
    return 'TIME (15 mile)';
  }

  getBikeEnTableTitle() {
    if (this.profile) {
      if (this.profile.measurementSystem === 'standard') {
        return 'En TIME (15 mile)';
      } else {
        return 'En TIME (25k)';
      }
    }
    return 'En TIME (15 mile)';
  }

  calculateDiff(first, second) {
    if (first.indexOf(':') > -1) {
      const firstTime = moment(first, 'HH:mm:ss');
      const secondTime = moment(second, 'HH:mm:ss');
      if (firstTime.isAfter(secondTime)) {
        return '+' + this.formatTime(moment.utc(moment(first, 'HH:mm:ss').diff(moment(second, 'HH:mm:ss'))).format('HH:mm:ss').toString());
      } else {
        return '-' + this.formatTime(moment.utc(moment(second, 'HH:mm:ss').diff(moment(first, 'HH:mm:ss'))).format('HH:mm:ss').toString());
      }
    } else {
      if (parseInt(first) >= parseInt(second)) {
        return '+' + (parseInt(first) - parseInt(second));
      } else {
        return parseInt(first) - parseInt(second);
      }
    }
  }
fahrenheitToCelsius(fahrenheit){
  var fTemp = fahrenheit;
  var fToCel = (fTemp - 32) * 5 / 9;
  return fToCel;
}
getMetricBasedTemp(temperature){
  temperature = parseInt(temperature);
  if (this.profile) {
    if (this.profile.measurementSystem != 'standard') {
      return Math.round(this.fahrenheitToCelsius(temperature));
    }
    return temperature;
  }
  return temperature;
}
getTemperatureUnit(){
  if (this.profile) {
    if (this.profile.measurementSystem != 'standard') {
      return "\xB0C";
    }
    else{
      return "\xB0F";
    }
  }
}

get paceUnit() {
  if (this.profile && this.profile.measurementSystem === 'standard') {
    return '(min/mile)';
  } else {
    return '(min/km)';
  }
}

  getAssessmentType() {
    const value = this.selectedAssessment.assessmentType.split('_').join('').toUpperCase();
    let unit = 'Yards';
    if (this.selectedAssessment.courseType !== 'scy') {
      unit = 'Meters';
    }
    return value + ' ' + unit;
  }

  getEditButton() {
    return this.creating || this.editing ? 'Cancel' : 'Edit';
  }

  getLocationText() {
    if (this.selectedAssessment && this.selectedAssessment.city && (this.selectedAssessment.state || this.selectedAssessment.country)) {
      return `${ this.selectedAssessment.city }, ${ this.selectedAssessment.state || this.selectedAssessment.country }`;
    }
    return this.accountAddress ? `${ this.accountAddress.city }, ${ this.accountAddress.state || this.accountAddress.country }` : '';
  }

  onPan(e) {
    this.browserScrollService.onPan(e);
  }

  onPanEnd(e) {
    this.browserScrollService.onPanEnd(e);
  }

  private _filterSelectedAssessment() {
    this.selectedAssessment.temperature = Math.round(this.selectedAssessment.temperature);
    if (this.selectedAssessment.ahr == null || this.selectedAssessment.ahr == 0
      || this.selectedAssessment.ahr == 1 || this.selectedAssessment.ahr == -1) {
      this.selectedAssessment.ahr = '';
    }
  }

  private _enableAssessment() {
    this.dashboardService.enableAssessment().subscribe((res) => {
      if (res.header.status === 'success') {
        this.profile.assessmentChecked = 1;
        localStorage.athleteProfile = JSON.stringify(this.profile);
      }
    });
  }

  private async _getAccountAddress() {
    try {
      const subscriptionRes = await this.userProfileService.subscription().toPromise();
      const {accountAddress} = subscriptionRes.body.response;
      return accountAddress;
    } catch (err) {
      console.error(err);
    }
  }

}
