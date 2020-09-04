import * as moment from 'moment';
import { Component, Input, SimpleChanges, SimpleChange, Output, EventEmitter, OnChanges, ViewEncapsulation } from '@angular/core';
import { WeeklySummaryService } from '../../weekly-summary.service';
import { environment } from '../../../../../../../environments/environment';
import { Animations } from '../../../../../constants/animations';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ManualCompletionModalComponent } from './manual-completion-modal/manual-completion-modal.component';
import { SessionService } from '../../../../session.service';
import * as FileSaver from 'file-saver';
import { MessageModalComponent } from '../../../../../common-components/message-modal/message-modal.component';
import { LocalstorageService } from './../../../../../common-services/localstorage.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PLACEHOLDER_MM_DD_YYYY } from '../../../../../constants/date-time.constants';
import {ConfirmationModalComponent} from "../../../../../common-components/confirmation-modal/confirmation-modal.component";
import {CommonUtils} from "../../../../../common-util/common-utils";
import { Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { WorkoutExportPreferencesService } from '../../../../../user/user-profile/preferences/notification-preferences/workout-export-preferences/workout-export-preferences.service';

@Component({
  selector: 'app-session-details',
  templateUrl: './session-details.component.html',
  styleUrls: ['./session-details.component.scss'],
  animations: [ Animations.NgIf.ngIfFadeIn ],
  encapsulation: ViewEncapsulation.None,
})
export class SessionDetailsComponent implements OnChanges {
  showMenu = false;
  sessionName;
  notesOpen = true;
  modalRef: BsModalRef;
  @Input() isMobileOrTablet;
  @Input() day: any;
  @Input() session: any;
  @Input() selectedParam: string;
  @Input() isCoachAccess: boolean;
  selectedResource;
  endpoint = environment.API_ENDPOINT;
  loading = false;
  @Output() action = new EventEmitter();
  @Output() sessionChange = new EventEmitter();
  @Output() addSession = new EventEmitter();
  @Output() refresh = new EventEmitter();
  @Input() resources: any;
  notes;
  activeTab = 'zones';

  profile: any;
  zone_colors = ['#2218af', '#3e39d9', '#6a44da', '#673498', '#9b50cf', '#d486ec'];

  private isWktDataAvailResp: any;
  private workoutExportPref: any;
  public workoutDownloadToolTip = 'Download workout';
  public workoutPushToolTip = 'Push workout to Garmin Device';

  iframeVideoTag: any;
  currentResourceBody: any;
  isCoachEditMode = false;
  coachEditDirty = false;
  pushWorkoutLoading = false;

  exportMetric = 'POWER';
  exportFileType = 'FIT';
  prependWUTime = 0;
  WUMSInsertTime = 0;
  appendMSTime = 0;

  constructor(
    private weeklyService: WeeklySummaryService,
    private modalService: BsModalService,
    private sessionService: SessionService,
    private workoutExportPreferencesService: WorkoutExportPreferencesService,
    private localstorageService: LocalstorageService,
    private sanitizer: DomSanitizer,
    private router: Router,
  ) {
    this.profile = this.localstorageService.getAthleteProfileIfExists();
  }

  get phaseFirstSessionDateFormat() {
    return this.profile && this.profile.prefDateFormat || PLACEHOLDER_MM_DD_YYYY;
  }

  get showAddFirstRace() {
    return this.profile && (!this.profile.firstRace || this.profile.firstRace == 0);
  }

  get currentResource() {
    const resource = this.selectedResource || this.resources[0];
    if (resource.resultType !== 'video') {
      this.iframeVideoTag = resource.body.match(/(<\s*iframe[^>]*>(.*?)<\s*\/\s*iframe>)/g);
      this.iframeVideoTag = this.iframeVideoTag?this.sanitizer.bypassSecurityTrustHtml(this.iframeVideoTag[0]):null;
   this.currentResourceBody = resource.body.replace(/<(p|div)(.*)?>(Tag(s?):.*)?(\s)?<\/(p|div)>/g, '');
    }
    return resource;
  }

  canComplete(session) {
    return !moment(session.date).isAfter(moment());
  }

  setParam(param) {
    this.selectedParam = param;
  }

  background(num, type) {
    const colorIndex = parseInt(type.split('')[1]) - 1;
    return 'linear-gradient(90deg,' + this.zone_colors[colorIndex] + ' ' + num + '%, transparent ' + num + '%)';
  }

  getZoneName(zone) {
    const sessionName = this.session.sessionName;
    const zoneType = zone.zoneType;
    if (sessionName && zoneType) {
      if (sessionName.toLowerCase().trim() === 'swim') {
        if (zoneType.toLowerCase().trim() == 'z1') {
          return 'Easy';
        } else if (zoneType.toLowerCase().trim() == 'z2') {
          return 'Smooth';
        } else if (zoneType.toLowerCase().trim() == 'z3') {
          return 'Moderate';
        } else if (zoneType.toLowerCase().trim() == 'z4') {
          return 'Threshold';
        } else if (zoneType.toLowerCase().trim() == 'z5') {
          return 'Fast';
        } else if (zoneType.toLowerCase().trim() == 'z6') {
          return 'All Out';
        }
      } else if (sessionName.toLowerCase().trim() === 'bike') {
        if (zoneType.toLowerCase().trim() == 'z1') {
          return 'Easy';
        } else if (zoneType.toLowerCase().trim() == 'z2') {
          return 'Endurance';
        } else if (zoneType.toLowerCase().trim() == 'z3') {
          return 'Tempo';
        } else if (zoneType.toLowerCase().trim() == 'z4') {
          return 'Threshold';
        } else if (zoneType.toLowerCase().trim() == 'z5') {
          return 'Super-threshold';
        } else if (zoneType.toLowerCase().trim() == 'z6') {
          return 'Maximal';
        }
      } else if (sessionName.toLowerCase().trim() === 'run') {
        if (zoneType.toLowerCase().trim() == 'z1') {
          return 'Easy';
        } else if (zoneType.toLowerCase().trim() == 'z2') {
          return 'Endurance';
        } else if (zoneType.toLowerCase().trim() == 'z3') {
          return 'Marathon';
        } else if (zoneType.toLowerCase().trim() == 'z4') {
          return 'Threshold';
        } else if (zoneType.toLowerCase().trim() == 'z5') {
          return 'Interval';
        } else if (zoneType.toLowerCase().trim() == 'z6') {
          return 'Repetition';
        }
      }
    }
  }

  getZonePercentage(zone) {
    if (this.session.actualTotal) {
      var actual = zone.actual;
      if (this.selectedParam == 'heartrate') {
        actual = parseInt(zone.actualHr);
      } else if (this.selectedParam == 'power') {
        actual = parseInt(zone.actualPower);
      } else if (this.selectedParam == 'pace') {
        actual = parseInt(zone.actual);
      }
      if (zone.planned && actual && zone.planned !== '0' && actual !== '0') {
        return Math.min(1, parseInt(actual) / parseInt(zone.planned)) * 100;
      } else if (parseInt(actual) > parseInt(zone.planned)) {
        return 100;
      }
      else
        return 0;

    }
  }

  getZoneWidth(zone) {
    var planned = 0;
    if (this.session.actualTotal) {
      planned = parseInt(this.session.actualTotal);
    }
    var actual = zone.actual;
    if (this.selectedParam == 'heartrate') {
      actual = parseInt(zone.actualHr);
    } else if (this.selectedParam == 'power') {
      actual = parseInt(zone.actualPower);
    } else if (this.selectedParam == 'pace') {
      actual = parseInt(zone.actual);
    }
    if (planned > 0) {
      // console.log(Math.min(1, parseInt(actual) / planned) * 100);
      return 'calc(' + Math.min(1, parseInt(actual) / planned) * 100 + '%)';
    } else {
      return '0%';
    }
  }

  getBar(zone) {
    if (this.session.actualTotal) {
      // if (zone.zoneLabel === 'Sustained') {
      //   console.log((parseInt(zone.actual) / parseInt(zone.planned)) * 100);
      // }
      if (zone.planned && zone.actual && zone.planned !== '0' && zone.actual !== '0') {
        return this.background((parseInt(zone.actual) / parseInt(zone.planned)) * 100, zone.zoneType);
      } else if (parseInt(zone.actual) > parseInt(zone.planned)) {
        return this.background(100, zone.zoneType);
      }
    } else {
      let sum = 0;
      for (const zn of this.session.zones) {
        sum += parseInt(zn.planned);
      }
      return this.background((parseInt(zone.planned) / sum) * 100, zone.zoneType);
    }
  }

  convertToHHMM(seconds) {
    if (seconds) {
      const date = new Date(null);
      date.setSeconds(parseInt(seconds)); // specify value for SECONDS here
      return date.toISOString().substr(11, 5);
    }
  }

  async update(key, value) {
      this.loading = true;
      const updatedObj = new Object();
      updatedObj[key] = value;
      try {
        const res = await this.weeklyService.updateDayData(updatedObj, this.session.sessionId);
        this.loading = false;
      } catch (err) {
        console.error(err);
        this.loading = false;
      }
  }

  async coachScheduleUpdate({warmUp, mainSet, coolDown}: any) {
    if (warmUp) {
      this.session.sessionDetail.warmUp = warmUp;
    } else {
      delete this.session.sessionDetail.warmUp;
    }
    if (mainSet) {
      this.session.sessionDetail.mainSet = mainSet;
    } else {
      delete this.session.sessionDetail.mainSet;
    }
    if (coolDown) {
      this.session.sessionDetail.coolDown = coolDown;
    } else {
      delete this.session.sessionDetail.coolDown;
    }
    this.loading = true;
    try {
      await this.weeklyService.coachScheduleUpdate(this.session);
      this.coachEditDirty = false;
      this.isCoachEditMode = false;
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  openManualCompletionModal() {
    const initialState = {
      session: this.session,
    };
    this.modalRef = this.modalService.show(ManualCompletionModalComponent, {
      class: 'modal-lg', initialState, backdrop: false,
      ignoreBackdropClick: false });
    this.modalRef.content.displayModal = this.modalRef;
    this.modalRef.content.sessionChange.subscribe(() => {
      this.sessionChange.emit();
    });
  }

  getManualButtonTitle() {
    if (
        this.session.actualTotal
     || this.session.linkedFiles && this.session.linkedFiles.length > 0
    ) {
      return 'Edit Session Details';
    } else {
      return 'Manually Complete';
    }
  }

  openMenu() {
    this.showMenu = !this.showMenu;
  }

  sessionAction(action) {
    this.action.next(action);
  }

  ngOnChanges(changes: SimpleChanges) {
    const session: SimpleChange = changes.session;
    if (typeof session === 'undefined') {
      return;
    }
    if (session.currentValue &&  session.currentValue.sessionType === 'bike') {
      this.checkForWorkoutData();
      this.getWorkoutExportPreferences();
    }
  }

  getProfileImage() {
    let src = this.endpoint;
    if (this.profile.profileImageSmall) {
      src += this.profile.profileImageSmall;
    } else if (this.profile.profileImageLarge) {
      src += this.profile.profileImageLarge;
    } else if (this.profile.profileImage) {
      src += this.profile.profileImage;
    } else {
      return '../assets/img/svg/icons/profile-icon.svg';
    }
    return src;
  }

  getRangeStart(range: string) {
    const match = range.split(/\s+\-\s+/);
    return match && match[0];
  }

  getRangeEnd(range: string) {
    const match = range.split(/\s+\-\s+/);
    return match && match[1];
  }

  shouldMoveBeEnabled(session) {
    if (!session) {
      return false;
    }
    return !session.actualTotal;
  }

  shouldCoachEditBeEnabled(session) {
    return this.isCoachAccess;
  }

  shouldAddBeEnabled() {
    return !this.isCoachAccess;
  }

  shouldRestoreBeEnabled(session) {
    if (!session) {
      return false;
    }
    return session.isFromDifferentWeek == 'true';
  }

  shouldDeleteBeEnabled(session) {
    if (!session) {
      return false;
    }
    if (this.isCoachAccess) {
      return true;
    }
    return !session.actualTotal && session.isAthleteCreated == 'true';
  }

  shouldUploadBeEnabled(session) {
    if (!session) {
      return false;
    }
    if (session.actualTotal) {
      return false;
    }
    return session.sessionType !== 'strength' && this.canComplete(session);
  }

  shouldUnlinkBeEnabled(session) {
    if (!session) {
      return false;
    }
    return session.linkedFiles && session.linkedFiles.length > 0;
  }

  public async exportWorkout(session, exportType: string): Promise<void> {
    try {
      this.loading = true;
      const res: any = await this.sessionService.exportWorkout(session.sessionId, exportType).toPromise();
      const headers = res.headers;
      const contentDispositionHeader = headers.get('Content-Disposition');
      const fileName = contentDispositionHeader.split(';')[1].trim().split('=')[1];
      const blob = exportType === 'fit' ? new Blob([res.body]) : new Blob([res.body], { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(blob, fileName.replace(/"/g, ''));
      this.loading = false;
    } catch (err) {
      console.error('Workout Export Error', err);
      this.loading = false;
      this.showModalMessage(err, err);
    }
  }

  isSessionNotesEmpty(notes: any[]) {
    if (!notes || !notes.length) {
      return true;
    }
    return notes.every(note => !note || !note.content || this.isSessionDetailEmpty(note.content));
  }

  isSessionDetailEmpty(input: string) {
    if (!input) {
      return true;
    }

    if ([
      /^\s*$/i,
      /^cd$/i,
      /^cool\s*down$/i,
      /^ms$/i,
      /^main\s*set$/i,
      /^wu$/i,
      /^warm\s*up$/i,
      /^n\/a$/i,
      ].some(x => !!input.trim().match(x))
    ) {
      return true;
    }

    return false;
  }

  private async checkForWorkoutData(): Promise<void> {
    try {
      const resp = await this.sessionService.isWorkoutDataAvailable(this.session.sessionId).toPromise();
      if (resp.body) {
        this.isWktDataAvailResp = resp.body;
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async getWorkoutExportPreferences(): Promise<void> {
    try {
      const resp = await this.workoutExportPreferencesService.getWorkoutExportPreferencesForSession(this.session.sessionId).toPromise();
      if (resp.body) {
        const workoutExportPref = resp.body.response;
        this.exportFileType = workoutExportPref.prefExportFileType;
        this.exportMetric = this.exportFileType !== 'FIT' ? 'POWER' : workoutExportPref.prefIntensityMetric;
        this.prependWUTime = workoutExportPref.defaultPrependWUTime;
        this.WUMSInsertTime = workoutExportPref.defaultWUMSInsertTime;
        this.appendMSTime = workoutExportPref.defaultAppendMSTime;
      }
    } catch (error) {
      console.log(error);
    }
  }

  public async downloadSessionWorkout() {
    if (this.isWktDataAvailResp.isWorkoutDownloadAllowed === "false" && !this.isWktDataAvailResp.workoutDownloadErrorMessage) {
      const msg = 'Export workouts is not available for your current subscription level. Please upgrade your subscription to use this feature.';
      const replaceLocation = `/user/subscription-options`;
      const successBtnTxt = 'Upgrade'
      this.createActivationModalMessage(msg, successBtnTxt, replaceLocation);
    } else if (this.isWktDataAvailResp.isWorkoutDownloadAllowed === "false" && this.isWktDataAvailResp.workoutDownloadErrorMessage) {
      CommonUtils.modalMessage('Information', this.isWktDataAvailResp.workoutDownloadErrorMessage, this.modalRef, 'info', this.modalService, 'DISMISS');
    }
  }

  public async pushSessionWorkoutToGarmin(session) {
    try {
      if(this.isWktDataAvailResp.isWorkoutPushAllowed === "false" && !this.isWktDataAvailResp.pushDownloadErrorMessage) {
        const msg = 'Pushing workouts is not available for your current subscription level. Please upgrade your subscription to use this feature.';
        const replaceLocation = `/user/subscription-options`;
        const successBtnTxt = 'Upgrade'
        this.createActivationModalMessage(msg, successBtnTxt, replaceLocation);
      } else if(this.isWktDataAvailResp.isWorkoutPushAllowed === "false" && this.isWktDataAvailResp.pushDownloadErrorMessage) {
        CommonUtils.modalMessage('Information', this.isWktDataAvailResp.pushDownloadErrorMessage, this.modalRef, 'info', this.modalService, 'DISMISS');
      } else if(this.isWktDataAvailResp.isTrainingAPIConnected === "false") {
        const msg = 'Please connect to and authorize Garmin Training to push workouts to your device.';
        const replaceLocation = `/user/devices`;
        const successBtnTxt = 'Connect'
        this.createActivationModalMessage(msg, successBtnTxt, replaceLocation);
      } else {
        await this.pushToGarmin(session);
      }
    } catch (err) {
      console.error('Workout Push error', err);
      this.showModalMessage(err, err);
    }
  }

  private async pushToGarmin(session: any) {
    this.pushWorkoutLoading = true;
    try {
      await this.sessionService.pushSessionWorkoutToGarmin(session.sessionId).toPromise(); 
      CommonUtils.defaultSuccessModalMessage(this.modalService, 'Successfully pushed workout to your device.');
    } catch (err) {
      console.error(err);
      CommonUtils.defaultErrorModalMessage(this.modalService);
    } finally {
      this.pushWorkoutLoading = false;
    }
  }

    private createActivationModalMessage(msg, successBtnTxt, replaceLocation) {
      this.modalRef = this.modalService.show(ConfirmationModalComponent);
      this.modalRef.content.message = msg;
      this.modalRef.content.displayModal = this.modalRef;
      this.modalRef.content.modalType = 'info';
      this.modalRef.content.modalTitle = 'Information';
      this.modalRef.content.successBtnTxt = successBtnTxt;
      this.modalRef.content.cancelBtnEnabled = true;
      this.modalRef.content.confirmation.subscribe((decision) => {
        if (decision === true) {
          this.modalRef.hide();
          this.router.navigate([replaceLocation]);
        }
      });
    }

  private showModalMessage(res, err): void {
    this.modalRef = this.modalService.show(MessageModalComponent);
    this.modalRef.content.displayModal = this.modalRef;
    if (res) {
      this.modalRef.content.parseAndSetBackendResponse(res);
    } else {
      this.modalRef.content.showException(err);
    }
  }

  public async confirmAutoCreationReview(): Promise<void> {
    try {
      this.session.autoCreationReviewed = true;
      await this.sessionService.confirmAutoCreatedSessionReview(this.session.sessionId).toPromise();
    } catch (err) {
      console.error('Error while updating the Session Auto Creation Review Confirmation', err);
    }
  }

  changeBrTagToNewLine(input: string) {
    return input && input.replace(/<\s*br\s*\/?>/g, '\n');
  }

  changeNewLineToBrTag(input: string) {
    return input && input.replace(/\n/g, '<br>');
  }

  preventClose(event: MouseEvent) {
    event.stopImmediatePropagation();
  }

  public async exportSession(session, 
    metric: string, // HR or POWER
    fileType: string, // ERG, MRC, FIT, ZWO
    prependWUTime: number,
    appendMSTime: number,
    WUMSInsertTime: number): Promise<void> {
    try {
      this.loading = true;
      this.sessionService.exportSession(session.sessionId, {
        "prefIntensityMetric": metric,
        "prefExportFileType": fileType,
        "defaultPrependWUTime": prependWUTime || 0,
        "defaultAppendMSTime": appendMSTime || 0,
        "defaultWUMSInsertTime": WUMSInsertTime || 0
      }).subscribe(
        (resp: HttpResponse<any>) => {
          const headers = resp.headers;
          const contentDispositionHeader = headers.get('Content-Disposition');
          const fileName = contentDispositionHeader.split(';')[1].trim().split('=')[1];
          const blob = fileType === 'FIT' ? new Blob([resp.body]) : new Blob([resp.body], { type: 'text/plain;charset=utf-8' });
          FileSaver.saveAs(blob, fileName.replace(/"/g, ''));
        }
      )
    } catch (err) {
      console.error('Session Export Error', err);
      this.loading = false;
      this.showModalMessage(err, err);
    }
  }

  public exportFileTypeChanged(value: string): void {
      if (value !== 'FIT') {
          this.exportMetric = 'POWER';
      }
  }

  public decrementPrependTime(): void {
    if (this.prependWUTime <= 0) {
      return;
    }
    this.prependWUTime -= 1;
  }

  public incrementPrependTime(): void {
    if (this.prependWUTime >= 90) {
      return;
    }
    this.prependWUTime += 1;
  }

  public decrementAppendTime(): void {
    if (this.appendMSTime <= 0) {
      return;
    }
    this.appendMSTime -= 1;
  }

  public incrementAppendTime(): void {
    if (this.appendMSTime >= 90) {
      return;
    }
    this.appendMSTime += 1;
  }

  public decrementInsertTime(): void {
    if (this.WUMSInsertTime <= 0) {
      return;
    }
    this.WUMSInsertTime -= 1;
  }

  public incrementInsertTime(): void {
    if (this.WUMSInsertTime >= 90) {
      return;
    }
    this.WUMSInsertTime += 1;
  }
}
