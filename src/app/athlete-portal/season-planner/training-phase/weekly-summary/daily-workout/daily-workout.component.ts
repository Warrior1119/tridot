import * as moment from 'moment';
import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { BsModalService} from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MoveCopyComponent } from '../single-week/move-copy/move-copy.component';
import { WeeklySummaryService } from '../weekly-summary.service';
import { AddComponent } from '../single-week/add/add.component';
import { UploadDataFileComponent } from '../single-week/upload-data-file/upload-data-file.component';
import { DEFAULT_ERROR_MESSAGE, MIN_TRACKPOINTS_FOR_MAP, TABLET_WIDTH_THRESHOLD, MOBILE_WIDTH_THRESHOLD } from '../../../../../athlete-portal/constants/constants';
import { ConfirmationModalComponent } from '../../../../common-components/confirmation-modal/confirmation-modal.component';
import { MetricsComponent } from './metrics/metrics.component';
import { AddEntryMultipleComponent } from './add-entry-multiple/add-entry-multiple.component';
import { array2map } from '../../../../../utils/array';
import { GeolocationService } from '../../../../common-services/geolocation.service';
import { ToastrService } from 'ngx-toastr';
import { Animations } from '../../../../../athlete-portal/constants/animations';
import { LocalstorageService } from './../../../../common-services/localstorage.service';
import { CommonUtils } from '../../../../common-util/common-utils';
import { getWindowWidth, isMobileSafari } from '../../../../../utils/browser';
import { BeginnerModalComponent } from '../../../../../onboard/beginner-modal/beginner-modal.component';
import { WelcomeModalComponent } from '../../../../../onboard/welcome-modal/welcome-modal.component';
import { GeneticsService } from '../../../../../routes/genetics/genetics.service';
import { LinkSessionComponent } from '../single-week/link-session/link-session.component';

@Component({
  selector: 'app-daily-workout',
  templateUrl: './daily-workout.component.html',
  styleUrls: ['./daily-workout.component.scss'],
  animations: [ Animations.NgIf.ngIfExpandHeight ],
  encapsulation: ViewEncapsulation.None,
})
export class DailyWorkoutComponent implements OnInit {
  day;
  modalRef: BsModalRef;
  session;
  weather;
  profile: any;
  resources;
  selectedResource;
  selectedMetrics;
  metricsToDisplay;
  zonesSelectedParam;
  sessionCompleteExpanded = false;
  displayMap = false;
  mapLocation;
  dailyWorkOutModalRef;
  selectedSessionId;
  selectedDataFile;
  alerts: any[] = [];
  phaseId: string;
  newlyGeneratedSessionId;
  loading: Boolean = false;
  showMoreMetricClicked = false;
  newlySelectedSessionType = 'swim';
  addNewSessionToggled = false;
  isCoachAccess = false;
  showMoreMetricButn = false;
  lastMetric;
  geneticsConnectionStatus: boolean;

  constructor(
    private weeklyService: WeeklySummaryService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private changeDetector: ChangeDetectorRef,
    private geolocationService: GeolocationService,
    private toastr: ToastrService,
    private localstorageService: LocalstorageService,
    private geneticsService: GeneticsService,
  ) {
    try {
      this.profile = this.localstorageService.getAthleteProfileIfExists();

      if(this.localstorageService.getIsCoachAccess()){
        this.isCoachAccess = true;
      } else{
        this.isCoachAccess = false;
      }

    } catch (err) {
      CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg || 'Something went wrong while getting athlete profile', this.modalRef, 'error', this.modalService, 'DISMISS');
      console.error(err);
    }
  }

  get date() {
    let date = this.day && this.today(this.day.date);

    return moment(date).format('MM/DD/YYYY')
  }

  get isMobileOrTablet() {
    return getWindowWidth(window) < TABLET_WIDTH_THRESHOLD;
  }

  get isMobile() {
    return getWindowWidth(window) < MOBILE_WIDTH_THRESHOLD;
  }

  async ngOnInit() {
    this.loadData();
    const initialState = {} as any;
    let template;
    if (localStorage.testDriveRestarted) {
      template = BeginnerModalComponent;
      initialState.profile = this.profile;
      localStorage.removeItem('testDriveRestarted');
    } else if (localStorage.onboardingComplete) {
      template = WelcomeModalComponent;
      localStorage.removeItem('onboardingComplete');
    }
    if (template) {
      this.modalRef = this.modalService.show(template, {
        class: 'modal-lg',
        initialState,
        backdrop: false,
        ignoreBackdropClick: true
      });
      this.modalRef.content.displayModal = this.modalRef;
    }
    this.geneticsConnectionStatus = await this.geneticsService.getConnectionStatus();
  }

  gotoMetrics() {
    this.router.navigate(['/user/user-profile/permissions/daily-metric-tracking']);
  }

  newSelectedSessionType(sessionTypeAndToggled){
    this.newlySelectedSessionType = sessionTypeAndToggled.type;
    this.addNewSessionToggled = sessionTypeAndToggled.addToggled;
  }


  async loadData() {
    this.route.queryParams.subscribe(async ({day, sessionId}) =>  {
      if (sessionId) {
        this.selectedSessionId = sessionId;
      }

      if (day) {
        await this.getDay(day, this.selectedSessionId);
      } else {
        const today = new Date();
        this.router.navigate([
          '/season-planner/training-phase/weekly-summary/daily-workout'],
          {
            queryParams: {
              day: (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear()
            }
          });
      }
    });
  }

  getScore() {
    if (!this.session || this.session.achievement === null) {
      return 'n/a';
    }
    return this.session.achievement || this.session.achievementHr || 'n/a';
  }

  refresh() {
    this.getDay(this.today(this.day.date));
  }

  tomorrow(date) {
    return moment(date).add('day', 1).format('YYYY-MM-DD');
  }

  today(date) {
    return moment(date).format('YYYY-MM-DD');
  }

  yesterday(date) {
    return moment(date).add('day', -1).format('YYYY-MM-DD');
  }

  get displayStats() {
    return this.session && this.session.isLinkedFile === 'true' &&
    ((this.session.activityStats && this.session.activityStats.length ||
      this.session.fallbackStats && this.session.fallbackStats.length) ||
    (this.session.activitySplits && this.session.activitySplits.length))
  }

  async getDay(day, selectedSessionId?) {
    // this.toastr.success('Getting info...');
    try {
      this.loading = true;
      const date = this.today(day);
      const res = await this.weeklyService.getNextDate(date).toPromise();
      this.day = res.body.response;
      this.loading = false;
      if (!this.day.date || this._isSubExpired(this.day.date)) {
        this.day = { ...this.day, date, noData: true };
        this.session = null;
        // this.toastr.warning('No data');
        await this._getMetrics();
        await this._getMultiWeeks(date);
        this._getWeather(moment(date).format('YYYY-MM-DD HH:mm:ss.000'), '06:00AM', 'HOME');
        return;
      }

      if (this.newlyGeneratedSessionId) {
        if (this.newlyGeneratedSessionId === -1) {
          this.selectedSessionId = this.day.sessions[this.day.sessions.length - 1].sessionId;
          this.phaseId = this.day.sessions[this.day.sessions.length - 1].phaseId;
        } else if (this.day) {
          const session = this.day.sessions.find(sess => sess.sessionId == this.newlyGeneratedSessionId);
          this.selectedSessionId = session.sessionId;
          this.phaseId = session.phaseId;
        }
        this.newlyGeneratedSessionId = undefined;
      } else {
        this.selectedSessionId = selectedSessionId || this.day.sessions[0].sessionId;
        this.phaseId =  this.day.sessions[0].phaseId;
      }
      await this._getMetrics();
      await this._getMultiWeeks(date);
      this.mapLocation = await this._getCoordsSafe();
      return;
    } catch (err) {
      console.error(err);
      CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg || 'Something went wrong while getting day', this.modalRef, 'error', this.modalService, 'Try Again');
    }

  }

  async getNextDay() {
    // this.toastr.success('Getting Next Day...');
    const date = moment(this.day.date).add('day', 1).toDate();
    this.router.navigate([
      '/season-planner/training-phase/weekly-summary/daily-workout'],
      {
        queryParams: {
          day: (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear()
        }
      });
  }

  async getPrevDay() {
    // this.toastr.success('Getting Prev Day...');
    const date = moment(this.day.date).add('day', -1).toDate();
    this.router.navigate([
      '/season-planner/training-phase/weekly-summary/daily-workout'],
      {
        queryParams: {
          day: (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear()
        }
      });
  }

  updateNotes(notes) {
    let ref = CommonUtils.modalMessage('Updating Notes', 'Please wait while we update the notes and update your workout page.', this.modalRef, 'loading', this.modalService, null);
    this.weeklyService.updateNotes(notes, this.session.sessionId).subscribe((res) => {
      console.log(res);
      setTimeout(() => {
        ref.modalRef.hide();

      }, 2000);
    });
  }

  openMetrics() {
    const initialState = {
      selectedMetrics: this.selectedMetrics,
      status: 'view'
    };

    this.modalRef = this.modalService.show(MetricsComponent, { class: 'modal-lg modal-metrics', initialState });
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.saveMetrics.subscribe((res) =>  {
      this.saveMetrics(res);
    });
  }

  async saveMetrics(metrics) {
    // this.toastr.success('Updating Metrics...');
    let ref;
    try {
      ref = CommonUtils.modalMessage('Saving Metrics', 'Please wait while we save the metrics and update your workout page.', this.modalRef, 'loading', this.modalService, null);
      await this.weeklyService.saveMetrics(metrics);
      this.toastr.success('Successfully updated metrics');
      // Refresh metrics
      this.metricsToDisplay = await this.weeklyService.getMetricsToDisplay(this.selectedMetrics, this.day.date);
      ref.modalRef.hide();
    } catch (err) {
      ref.modalRef.hide();
      CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg || 'Something went wrong while saving metrics', this.modalRef, 'error', this.modalService, 'DISMISS');
      console.error(err);
    }
  }

  extractDate(date) {
    const d = new Date(date);
    return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
  }

  moveOrCopy([action, dayOrSession, data]) {
    this.modalRef = this.modalService.show(MoveCopyComponent, { backdrop: isMobileSafari() ? 'static' : true });
    this.modalRef.content.MoveOrCopy = action;
    this.modalRef.content.dayOrSession = dayOrSession;
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.setDate.subscribe((selectedDate) =>  {
      const id = (dayOrSession === 'session') ? parseInt(data.sessionId) : this.day.sessions[0].phaseId;

      if (action === 'move') {
        // this.toastr.success('Moving...');
        let ref = CommonUtils.modalMessage('Moving Session', 'Please wait while we move the session and update your workout page.', this.modalRef, 'loading', this.modalService, null);
        this.weeklyService.move(data.date, this.extractDate(selectedDate), id, dayOrSession).subscribe(res =>  {
          if (res.header.status === 'success') {
            this.toastr.success('Moved');
            if (action === 'move') {
              window.location.replace(`/season-planner/training-phase/weekly-summary/daily-workout?day=${data.date}`);
            }
          }
          ref.modalRef.hide();
        }, (err) =>  {
          ref.modalRef.hide();
          CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg || 'Something went wrong while moving session', this.modalRef, 'error', this.modalService, 'DISMISS');
          console.error(err);
        });
      } else if (action === 'copy') {
        // this.toastr.success('Copying...');
        let ref = CommonUtils.modalMessage('Copying Session', 'Please wait while we copy the session and update your workout page.', this.modalRef, 'loading', this.modalService, null);
        this.weeklyService.copy(data.date, this.extractDate(selectedDate), id, dayOrSession).subscribe(res =>  {
          if (res.header.status === 'success') {
            this.toastr.success('Copied');
          }
          ref.modalRef.hide();
        }, (err) =>  {
          ref.modalRef.hide();
          CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg || 'Something went wrong while copying session', this.modalRef, 'error', this.modalService, 'DISMISS');
         console.error(err);
        });
      }
    });
  }

  upload(session) {
    this.modalRef = this.modalService.show(UploadDataFileComponent);
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.file.subscribe(async file =>  {

      // this.toastr.success('uploading...');
      let ref;
      try {
         ref = CommonUtils.modalMessage('Uploading File', 'Please wait while we upload the file and update your workout page.', this.modalRef, 'loading', this.modalService, null);
        const res = await this.weeklyService.uploadFile(
          session && session.sessionType,
          session && parseInt(session.sessionId),
          file
        ).toPromise();

        if (res.header.status === 'success') {
          const { sessionType, sessionTypeInFile } = res.body;
          if (res.header.accessToken === 'newToken' || sessionType.toLowerCase() === sessionTypeInFile.toLowerCase()) {
            this._uploadConfirm(session, file);
          } else {
            const initialState = {
              modalTitle: 'Are you sure?',
              message: `Are you sure you want to link a ${sessionTypeInFile.toUpperCase()} file to a ${sessionType.toUpperCase().toUpperCase()} session?`,
              successBtnTxt: 'Yes, link it!'
            };
            this.modalRef = this.modalService.show(ConfirmationModalComponent, { initialState });
            this.modalRef.content.displayModal = this.modalRef;

            this.modalRef.content.confirmation.subscribe(async decision => {
              if (decision === true) {
                this._uploadConfirm(session, file);
              }
            });
          }
          ref.modalRef.hide();
        }else{
          ref.modalRef.hide();
        }
      } catch (err) {
        ref.modalRef.hide();
        CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg || 'Something went wrong while uploading', this.modalRef, 'error', this.modalService, 'DISMISS');
        console.error(err);
      }
    });
  }

  private async _uploadConfirm(session, file) {
    let ref = CommonUtils.modalMessage('Uploading File', 'Please wait while we upload the file and update your workout page.', this.modalRef, 'loading', this.modalService, null);
    const res = await this.weeklyService.uploadFile(
      session && session.sessionType,
      session && parseInt(session.sessionId),
      file,
      true
    ).toPromise();
    if (res.header.status === 'success') {
      ref.modalRef.hide();
      CommonUtils.modalMessage('Uploaded', '', this.modalRef, 'success', this.modalService, 'View Session');
     // this.toastr.success('Uploaded');
      this.getDay(this.day.date);
    }
    if (res.header.status === 'error') {
      ref.modalRef.hide();
      CommonUtils.modalMessage('Error', res && res.body && res.body.response && res.body.response.msg || 'Something went wrong while uploading', this.modalRef, 'error', this.modalService, 'DISMISS');
      console.error(res);
    }
  }

  add(day) {
    this.modalRef = this.modalService.show(AddComponent);
    this.modalRef.content.displayModal = this.modalRef;
    this.modalRef.content.session.subscribe(async sessionType => {

      // this.toastr.success('adding session...');
      let ref = CommonUtils.modalMessage('Adding Session', 'Please wait while we add the session and update your workout page.', this.modalRef, 'loading', this.modalService, null);
      const phaseId = day.sessions && day.sessions[0] && day.sessions[0].phaseId || this.phaseId;

      try {
        const res = await this.weeklyService.add(moment(day.date).format('MM/DD/YYYY'), sessionType, phaseId).toPromise();
        if (res.header.status === 'success') {
          ref.modalRef.hide();
          this.getDay(day.date);
          CommonUtils.modalMessage('Added New Session', '', this.modalRef, 'success', this.modalService, 'View Session');
          //this.toastr.success('Added New Session!');
        }
        else{
          ref.modalRef.hide();
        }
      } catch (err) {
        console.error(err);
        ref.modalRef.hide();
        CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg || DEFAULT_ERROR_MESSAGE, this.modalRef, 'error', this.modalService, 'DISMISS');
        //this.toastr.error(err && err.body && err.body.response && err.body.response.msg || DEFAULT_ERROR_MESSAGE);
      }
    });
  }

  onSessionNumbersUpdate() {
    this.getDay(this.session.date, this.session.sessionId);
  }
  onSessionUpdate(day){
    this.getDay(day.date);
  }
  shouldRestoreBeEnabled(session) {
    return session.isFromDifferentWeek == 'true';
  }

  shouldRestoreBeEnabledDay(sessions: any[]) {
    return sessions && sessions.every(session => this.shouldRestoreBeEnabled(session));
  }

  shouldAddBeEnabledDay(sessions) {
    return sessions && sessions.length || this.phaseId;
  }

  restore([day, restoreType]) {
    this.modalRef = this.modalService.show(ConfirmationModalComponent);
    this.modalRef.content.message = 'Are you sure you want to restore?';
    this.modalRef.content.displayModal = this.modalRef;
    let ref;
    this.modalRef.content.confirmation.subscribe((decision) =>  {
      console.log(decision);

      if (decision === true) {
        // this.toastr.success('restoring...');
        ref = CommonUtils.modalMessage('Restoring Session', 'Please wait while we restore the session and update your workout page.', this.modalRef, 'loading', this.modalService, null);
        const id = (restoreType === 'session') ? parseInt(day.sessionId) : this.day.sessions ? this.day.sessions[0].phaseId : null;
        if (day.date.indexOf('-') > -1) {
          this.day.date = moment(day.date).format('MM/DD/YYYY')
        }
        this.weeklyService.restore(day.date, id, restoreType).subscribe(res =>  {
          if (res.header.status === 'success') {
            ref.modalRef.hide();
            window.location.replace(`/season-planner/training-phase/weekly-summary/daily-workout?day=${day.date}`);
            CommonUtils.modalMessage('Restored', '', this.modalRef, 'success', this.modalService, 'View Session');
           // this.toastr.success('Restored');
          }
        }, (err) =>  {
          ref.modalRef.hide();
          CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg || 'Something went wrong onAlertChange', this.modalRef, 'error', this.modalService, 'DISMISS');
          console.error(err);
        });
      }
    });
  }

  async coachScheduleUpdate(session) {
    try {
      await this.weeklyService.coachScheduleUpdate(session);
    } catch (err) {
      CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg || 'Something went wrong while uploading', this.modalRef, 'error', this.modalService, 'DISMISS');
      console.error(err);
    }
  }

  onAlertsChange(alert) {
    try {
      if (typeof this.toastr[alert.type] === 'function') {
        this.toastr[alert.type](alert.msg);
      }
    } catch(err) {
      CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg || 'Something went wrong onAlertChange', this.modalRef, 'error', this.modalService, 'DISMISS');
      console.error(err);
    }
  }

  delete(data, deleteType) {
    let ref;
    this.modalRef = this.modalService.show(ConfirmationModalComponent);
    this.modalRef.content.message = 'Are you sure you want to delete this ' + deleteType + '?';
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.confirmation.subscribe((decision) =>  {

      if (decision === true) {
        ref = CommonUtils.modalMessage('Deleting Session', 'Please wait while we delete the session and update your workout page.', this.modalRef, 'loading', this.modalService, null);
        const id = (deleteType === 'session') ? parseInt(data.sessionId) : this.day.sessions[0].phaseId;

        // this.toastr.success('Deleting...');

        this.weeklyService.delete(data.date, id, deleteType).subscribe(res =>  {
          ref.modalRef.hide();
          this.getDay(data.date);
          if (res.header.status === 'success') {
            CommonUtils.modalMessage('Session Deleted', '', this.modalRef, 'success', this.modalService, 'View Session');
           // this.toastr.success('Deleted');
          }
        }, (err) =>  {
          ref.modalRef.hide();
          CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg || 'Something went wrong onAlertChange', this.modalRef, 'error', this.modalService, 'DISMISS');
          console.error(err);
        });
      }
    });
  }

  getResources(sessionId) {
    if (!this.session) {
      return;
    }
  //  let ref = CommonUtils.modalMessage('Getting Resource', 'Please wait while we get the resorce and update your workout page.', this.modalRef, 'loading', this.modalService, null)
    this.weeklyService.getSessionVideos(sessionId).subscribe((res) =>  {
      if (!this.session || sessionId != this.session.sessionId) {
       // ref.modalRef.hide();
        return;
      }
      this.resources = res.body.response;
      this.selectedResource = this.resources[0];
     // ref.modalRef.hide()
    });
  }

  openAddEntry(metric) {
    const initialState = {
      metric: metric ? metric : [],
      metrics: this.metricsToDisplay,
    };
    this.modalRef = this.modalService.show(AddEntryMultipleComponent, { initialState, class: 'modal-lg' });
    this.modalRef.content.displayModal = this.modalRef;
    this.modalRef.content.metricsToSave.subscribe(metricsToSave =>  {
      console.log("metric to save "+JSON.stringify(metricsToSave))
      let tempArray = []
      metricsToSave.forEach(metric => {
       if(metric.metricId < 47){
        tempArray.push(metric);
       }
      });
      const mapMetricValues = array2map(tempArray, x => x.metricId, x => x.model);
      this._submitMetricValues(mapMetricValues, this.day.date);
    });
  }

  async onSessionChange(session) {
    this.displayMap = false;
    if (session && session.sessionId) {
      this.selectedSessionId = session.sessionId;
      this.session = session;
      await this.getResources(this.session.sessionId);
      this._getWeather(this.session.date, this.session.sessionTime, this._getLookupType(this.session.location));
      if (session.sessionType === 'swim') {
        if (this.profile.measurementSystem === 'metric') {
          this.zonesSelectedParam = 'metersThenPace';
        } else {
          this.zonesSelectedParam = 'yardsThenPace';
        }
      } else if (session.sessionType === 'bike') {
        this.zonesSelectedParam = 'power';
      } else {
        this.zonesSelectedParam = 'pace';
      }

      if (session.isLinkedFile === "true" && session.zones !== null &&
        session.zones.length  > 0 &&
        ((session.zones[0].actualPower == null ||
        session.zones[0].actualPower == 0 ) && (session.zones[0].pace == null ||
          session.zones[0].pace == 0)) && session.zones[0].actualHr != 0) {
          this.zonesSelectedParam = 'heartrate';
      }
      if (session.isLinkedFile && session.linkedFiles.length) {
        //let refSessionLinkData
        try {
          // refSessionLinkData = CommonUtils.modalMessage('Getting Session Linked Data', 'Please wait while we get the session linked data and update your workout page.', this.modalRef, 'loading', this.modalService, null);

          const files = session.linkedFiles.filter(file => file.isLinkedSession && file.sessionType === session.sessionType);
          this.session.linkedData = await Promise.all(files.map(async ({ internalId }) => {
            const [dataset] = await this.weeklyService.getSessionLinkedData(internalId).toPromise();
            dataset.trackpoints = dataset.trackpoints.filter(({ latitude, longitude }) => latitude && longitude);
            return dataset;
          }));
          if (!this.session.activityStats) {
            try {
              const file = await files.find(file => file.isLinkedSession && file.sessionType === session.sessionType);
              if (file) {
                const res = await this.weeklyService.getSessionLegacyStats(this.session.sessionId, file.internalId, file.fileExtention).toPromise();
                this.session.fallbackStats = JSON.parse(res.body.response);
              }
            } catch (err) {
              CommonUtils.modalMessage('Error','Failed to retrieve fallback stats', this.modalRef, 'error', this.modalService, 'DISMISS');
              console.error('Failed to retrieve fallback stats', err);
            }
          }
          this.selectLinkedFile(0);
        //  refSessionLinkData.modalRef.hide();
        } catch (err) {
          //refSessionLinkData.modalRef.hide();
          CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg || 'Something went wrong on session change', this.modalRef, 'error', this.modalService, 'DISMISS');
          console.error(err);
        }
      }
    } else {
      this.newlyGeneratedSessionId = session;
      this.loadData();
    }
  }

  async unlinkFile(session) {
    let ref = CommonUtils.modalMessage('Unlinking File', 'Please wait while we unlink the file and update your workout page.', this.modalRef, 'loading', this.modalService, null);
    await this.weeklyService.unlinkFile(session.sessionId).toPromise();
    await this.loadData();
    ref.modalRef.hide();
  }

  async linkToAnotherSession(originalSession) {
    const file = originalSession.linkedFiles[0];
    this.toastr.success('Fetching sessions to link the file to...');
    this.weeklyService.fetchAllIncompleteSessions(file.trainingsessionFileMetaId, file.sessionType, file.dateTime).subscribe(res => {
      if (res.header.status !== 'success') {
        this.toastr.success('Failed');
      } else {
        const initialState = {
          files: res.body.response
        };
        this.modalRef = this.modalService.show(LinkSessionComponent, { class: 'modal-lg', initialState });
        this.modalRef.content.displayModal = this.modalRef;
        this.modalRef.content.session.subscribe(async session => {
          if (!session) {
            return;
          } else {
            let ref = CommonUtils.modalMessage('Link to Other Session',
                'Please wait while we unlink the file and link the selected session.', this.modalRef, 'loading', this.modalService, null);
            await this.weeklyService.unlinkFile(originalSession.sessionId).toPromise();
            this.weeklyService.link(file.trainingsessionFileMetaId, session.sessionId).subscribe(resp => {
              if (resp.header.status === 'success') {
                this.onSessionChange(resp.body.response.newlyGeneratedId);
                ref.modalRef.hide();
                this.toastr.success('Done');
              }
            }, (err) => {
              this.toastr.error(err && err.body && err.body.response && err.body.response.msg || DEFAULT_ERROR_MESSAGE);
            });
          }
        });
      }
    }, (err) => {
      this.toastr.error(err && err.body && err.body.response && err.body.response.msg || DEFAULT_ERROR_MESSAGE);
    });
  }


  sessionAction(action) {
    if (action === 'move' || action === 'copy') {
      this.moveOrCopy([action, 'session', this.session]);
    } else if (action === 'upload') {
      this.upload(this.session);
    } else if (action === 'restore') {
      this.restore([this.session, 'session']);
    } else if (action === 'delete') {
      this.delete(this.session, 'session');
    } else if (action === 'unlink') {
      this.unlinkFile(this.session);
    } else if (action === 'unlinkAndlinkToOthersession') {
      this.linkToAnotherSession(this.session);
    }
  }

  // Makes 'multiweek' request. Joins results of 'multiweek' and 'dayDetails' requests together
  private async _getMultiWeeks(date) {
    try {
      const multiweek =
        await this.weeklyService.getMultiWeeks(
          moment(date).isoWeekday('Monday').format('MM/DD/YYYY'),
          moment(date).isoWeekday('Sunday').format('MM/DD/YYYY'),
          await this._getCoordsSafe()
        ).toPromise();

      // Determine phaseId
      const {weeks} = multiweek.body.response;
      this.phaseId = weeks && weeks[0] && weeks[0].phaseId;

      for (const week of multiweek.body.response.weeks)
        for (const day of week.days) {
          if (!moment(day.date).isSame(moment(this.day.date))) {
            continue;
          }
          // Merge Zones
          for (const session of day.sessions) {
            const foundSession = this.day.sessions && this.day.sessions.find(x => x.sessionId === session.sessionId);
            if (foundSession) {
              foundSession.zones = session.zones;
              console.log('Successfully loaded zones', foundSession.zones)
            }
          }
          // Merge Unlinked files
          if (!this.day.unlinkedFiles) {
            this.day.unlinkedFiles = day.unlinkedFiles;
          }
        }

     this.changeDetector.detectChanges();
    } catch (err) {
      CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg || 'Something went wrong while getting multi weeks', this.modalRef, 'error', this.modalService, 'Try Again');
      console.error(err);
    }
  }

  onSessionCompleteToggle() {
    this.sessionCompleteExpanded = !this.sessionCompleteExpanded;
  }

  get mapCoords() {
    return this.displayMap ? this.session.trackpoints[0] : this.mapLocation;
  }

  selectLinkedFile(index: number) {
    this.displayMap = false;
    if (!this.session.linkedData || !this.session.linkedData[index]) {
      return;
    }
    this.session.trackpoints = this.session.linkedData[index].trackpoints;
    if (
      this.session.sessionType === 'swim' &&
      this.session.linkedData[index].activitySplits.some(split => split.lengths && split.lengths.length)
    ) {
      this.session.activitySplits = this.session.linkedData[index].activitySplits
        .filter(split => split.lengths && split.lengths.length)
        .flatMap(({ lengths }) => lengths);
    } else {
      this.session.activitySplits = this.session.linkedData[index].activitySplits;
    }
    this.selectedDataFile = index;
    if (this.session.trackpoints.length >= MIN_TRACKPOINTS_FOR_MAP) {
      this.displayMap = true;
    }
  }
  getMetricsToDisplay(metrics){
    let array = [];
    let minLength = 0;

    if(metrics && metrics.length > 0){
      minLength = metrics.length <= 3? metrics.length : 3;
      if(this.showMoreMetricClicked){
        for(let i=0; i<metrics.length;i++){
          array.push(metrics[i]);
        }
      }else{
        for(let i=0; i<minLength;i++){
          array.push(metrics[i]);
        }
      }

    }
    if(metrics && metrics.length > 3){
      this.showMoreMetricButn = true;
    }
    this.lastMetric = array[array.length-1];
    return array;
  }
  getBorder(metric){
    if(metric.metricId == this.lastMetric.metricId){
      return false;
    }
    else return true;
  }

  private async _getMetrics() {
    try {
      this.selectedMetrics = await this.weeklyService.getSelectedMetrics();
      this.metricsToDisplay = await this.weeklyService.getMetricsToDisplay(this.selectedMetrics, this.day.date);
    } catch (err) {
      CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg || 'Something went wrong while getting metrics', this.modalRef, 'error', this.modalService, 'DISMISS');
      console.log(err);
    }
  }

  private async _submitMetricValues(values, date) {
    let ref;
    try {
     ref = CommonUtils.modalMessage('Submiting Metrics', 'Please wait while we delete the session and update your workout page.', this.modalRef, 'loading', this.modalService, null);
      await this.weeklyService.saveMetricValues(values, date)
      // Refresh metrics
      this.metricsToDisplay = await this.weeklyService.getMetricsToDisplay(this.selectedMetrics, this.day.date);
      ref.modalRef.hide();
      // this.toastr.success('Metrics Updated!');
    } catch (err) {
      ref.modalRef.hide();
      CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg || DEFAULT_ERROR_MESSAGE, this.modalRef, 'error', this.modalService, 'DISMISS');
      console.error(err);
    }
  }

  private async _getWeather(date, sessionTime, lookupType: string) {
    let coords;
    try {
      if (lookupType === 'CURRENT') {

        const position = await this.geolocationService.getCurrentPosition();
        coords = position.coords;

      }
    } catch (err) {
      // CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg ||'Something went wrong while getting weather details', this.modalRef, 'error', this.modalService, 'DISMISS');
      console.error(err);
    } finally {
      try {
        const res = await this.weeklyService.getWeather(date, sessionTime, lookupType, coords, this.selectedSessionId).toPromise();
        this.weather = res.body.response;

      } catch (err) {
        // CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg ||'Something went wrong while getting weather', this.modalRef, 'error', this.modalService, 'DISMISS');
        console.error(err);
      }
    }
  }

  private _getLookupType(location: string) {
    if (location === 'HOME') {
      return 'HOME';
    }
    return 'CURRENT';
  }

  private _isSubExpired(date: string) {
    if (!this.isCoachAccess) {
      const profile = this.localstorageService.getAthleteProfileIfExists();
      const daysLeft = Math.max(profile.subscriptionDaysRemain, 7);
      return moment(date).isAfter(moment().add(daysLeft, 'day'));
    } else {
      return false;
    }
  }

  private async _getCoordsSafe() {
    try {
      const {coords} = await this.geolocationService.getCurrentPosition();
      return coords;
    } catch (err) {
      const message = err && err.body && err.body.response && err.body.response.msg || 'Something went wrong while getting coordinates';
      console.error(message, err);
      return { latitude: 0, longitude: 0 };
    }
  }

  public getMetricValue(metric): string {
    if (metric.metricOptions && metric.metricOptions.length > 0) {
      const selectedMetricOption = metric.metricOptions.find(val => val.optionKey  === metric.model);
      return selectedMetricOption ? selectedMetricOption.optionValue : '';
    } else {
      return metric.model
    }
  }
}