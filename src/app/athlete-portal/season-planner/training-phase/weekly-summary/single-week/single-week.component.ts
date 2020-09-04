import * as moment from 'moment';
import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, Output, ViewEncapsulation, SimpleChanges } from '@angular/core';
import { ConfirmationModalComponent } from '../../../../common-components/confirmation-modal/confirmation-modal.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { MoveCopyComponent } from './move-copy/move-copy.component';
import { AddComponent } from './add/add.component';
import { LinkSessionComponent } from './link-session/link-session.component';
import { UploadDataFileComponent } from './upload-data-file/upload-data-file.component';
import { WeeklySummaryService } from '../weekly-summary.service';
import { Router } from '@angular/router';
import { DEFAULT_ERROR_MESSAGE, MOBILE_WIDTH_THRESHOLD } from '../../../../../athlete-portal/constants/constants';
import { DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CommonUtils } from '../../../../common-util/common-utils';
import { getWindowWidth } from '../../../../../utils/browser';
import { LocalstorageService } from '../../../../common-services/localstorage.service';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { PLACEHOLDER_DD_MM_YYYY } from '../../../../constants/date-time.constants';

const SESSION_MAX_HEIGHT = 120;

@Component({
  selector: 'app-single-week',
  templateUrl: './single-week.component.html',
  styleUrls: ['./single-week.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SingleWeekComponent implements OnInit {
  today = new Date();
  modalRef: BsModalRef;
  selectedMetrics;
  @Input() week;
  @Input() selectedDay;
  @Input() phaseId: number;
  trainXScoreXPosition: string;
  weekStats;
  @Output() alerts = new EventEmitter();
  @Output() updateWeek = new EventEmitter();
  @ViewChild('seasonMenu', { read: ElementRef }) seasonMenu;
  subs = new Subscription();
  loading = false;
  number = 1;
  scrollbarWorkoutSummary = {
    suppressScrollX: true,
    wheelPropagation: false,
  } as PerfectScrollbarConfigInterface;
  profile: any;
  isCoachAccess = false;

  constructor(
    private router: Router,
    private weeklyService: WeeklySummaryService,
    private modalService: BsModalService,
    private dragulaService: DragulaService,
    private toastr: ToastrService,
    private localstorageService: LocalstorageService,
  ) {
    this.profile = localstorageService.getAthleteProfileIfExists();
  }

  get prefDateFormatMd() {
    return this.profile && this.profile.prefDateFormat === PLACEHOLDER_DD_MM_YYYY
      ? 'DD MMM'
      : 'MMM DD';
  }

  verifyIfToday(date) {
    return new Date(this.selectedDay).toDateString() === new Date(date).toDateString();
  }

  goToDailyWorkout(day) {
    if (day) {
      this.router.navigate(['season-planner/training-phase/weekly-summary/daily-workout'],
        { queryParams: { day: day.date, phaseId: this.phaseId } });
    }
  }


  goToSelectedSession(day, sessionId) {
    if (day) {
      this.router.navigate(
        ['season-planner/training-phase/weekly-summary/daily-workout'],
        { queryParams: { day: day.date, phaseId: this.phaseId, sessionId } });
    }
  }


  getWeekWorkload(startDate) {
    this.weeklyService.weekWorkload(startDate).subscribe((res) => {
      this.weekStats = res.body.response.weeks[0];
    }, (err) => {
      console.log(err);
    });
  }

  hasLinkedFile(day: { sessions: any[], unlinkedFiles: any[] }) {
    if (!day || !day.sessions || !day.sessions.length) {
      return false;
    }

    return day.sessions.some(session => session.linkedFiles.length);
  }

  onMouseMove(e: MouseEvent) {
    this.trainXScoreXPosition = `${e.offsetX}px`;
  }

  getScore(session) {
    if (!session) {
      return 'N/A';
    }

    const trainxScore = session.achievement || session.achievementHr;
    if (!trainxScore || trainxScore == 'na') {
      return 'N/A';
    }

    return trainxScore;
  }

  getWorkoutSummaryMaxHeight(day, session) {
    if (!day || !day.sessions || !session)  {
      return;
    }
    const index = day.sessions.indexOf(session);
    if (index === -1) {
      return;
    }
    const sessionsLengthMax = Math.max(...this.week.days.map(x => x.sessions && x.sessions.length));
    return (sessionsLengthMax - index) * SESSION_MAX_HEIGHT;
  }

  upload(session?) {
    let uploadModalref;
    this.modalRef = this.modalService.show(UploadDataFileComponent);
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.file.subscribe((file) => {

      // this.toastr.success('uploading...');
      uploadModalref = CommonUtils.modalMessage('Uploading File','Please wait while we upload file and update your training schedule.',this.modalRef,'loading',this.modalService,null);
      this.weeklyService.uploadFile(session && session.sessionType, session && parseInt(session.sessionId), file).subscribe((res) => {
        uploadModalref.title = "Upload Done"
        this.updateWeek.next(uploadModalref);
        // CommonUtils.modalMessage('Success','Upload done',this.modalRef,'success',this.modalService,'OK');
      }, (err) => {
        uploadModalref.modalRef.hide();
        CommonUtils.modalMessage('Error', err.error.body.response.msg || DEFAULT_ERROR_MESSAGE, this.modalRef,'error',this.modalService,'Try again');
        console.error(err);
      });
    });
  }

  add(day) {
    this.modalRef = this.modalService.show(AddComponent);
    this.modalRef.content.displayModal = this.modalRef;
    let addModalref;
    this.modalRef.content.session.subscribe(async newSession => {

      try {
        // this.toastr.success('adding session...');
        addModalref = CommonUtils.modalMessage('Adding Session','Please wait while we add the session and update your training schedule.',this.modalRef,'loading',this.modalService,null);
        const res = await this.weeklyService.add(day.date, newSession, this.week.phaseId).toPromise();
        if (res.header.status === 'success') {
          addModalref.title = "Session Added";
          this.updateWeek.next(addModalref);
          // CommonUtils.modalMessage('Success','Session added',this.modalRef,'success',this.modalService,null);
        }
      } catch (err) {
        console.error(err);
        addModalref.modalRef.hide();
        CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg || DEFAULT_ERROR_MESSAGE, this.modalRef,'error',this.modalService,'Try again');
      }
    });
  }

  restore(day, restoreType) {
    console.log(day);
    let restoreModalref;
    this.modalRef = this.modalService.show(ConfirmationModalComponent);
    this.modalRef.content.message = 'Are you sure you want to restore?';
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.confirmation.subscribe((decision) => {
      console.log(decision);

      if (decision === true) {
        // this.toastr.success('restoring...');
        restoreModalref = CommonUtils.modalMessage('Restoring Session','Please wait while we restore session and update your training schedule.',this.modalRef,'loading',this.modalService,null);
        const id = (restoreType === 'session') ? parseInt(day.sessionId) : this.week.phaseId;

        this.weeklyService.restore(day.date, id, restoreType).subscribe(res => {
          if (res.header.status === 'success') {
            restoreModalref.title = "Session Restored"
            this.updateWeek.next(restoreModalref);
            // CommonUtils.modalMessage('Success','Session restored',this.modalRef,'success',this.modalService,'OK');
          }
        }, (err) => {
          restoreModalref.modalRef.hide();
          CommonUtils.modalMessage('Error', err.error.body.response.msg || DEFAULT_ERROR_MESSAGE,this.modalRef,'error',this.modalService,'Try again');
          console.error(err);
        });
      }
    });
  }

  extractDate(date) {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  }

  delete(dayOrSession, deleteType: string) {
    this.modalRef = this.modalService.show(ConfirmationModalComponent);
    this.modalRef.content.message = `Are you sure you want to delete this ${deleteType}?`;
    this.modalRef.content.displayModal = this.modalRef;
    let deleteModalref;
    this.modalRef.content.confirmation.subscribe(async (decision) => {
      if (!decision) {
        return;
      }
      deleteModalref = CommonUtils.modalMessage('Deleting Session','Please wait while we delete session and update your training schedule.',this.modalRef,'loading',this.modalService,null);
      const id = deleteType === 'session' ? parseInt(dayOrSession.sessionId) : this.week.phaseId;

      // this.toastr.success('Deleting...');

      try {
        if (deleteType === 'session' && dayOrSession.linkedFiles && dayOrSession.linkedFiles.length) {
          // Unlink a file instead of deleting session
          await this.weeklyService.unlinkFile(dayOrSession.sessionId).toPromise();
        } else {
          await this.weeklyService.delete(dayOrSession.date, id, deleteType).toPromise();
        }
        deleteModalref.title = "Session Deleted";
        this.updateWeek.next(deleteModalref);
        // CommonUtils.modalMessage('Success','Session deleted',this.modalRef,'success',this.modalService,'OK');
      } catch (err) {
        deleteModalref.modalRef.hide();
        CommonUtils.modalMessage('Error', err.error.body.response.msg || DEFAULT_ERROR_MESSAGE,this.modalRef,'error',this.modalService,'Try again');
        console.error(err);
      }
    });
  }

  createSession(file) {
    if (this.loading) {
      return;
    }

    // this.toastr.success('Creating Session From File...');
    this.loading = true;
    let createModalref = CommonUtils.modalMessage('Creating Session','Please wait while we create session and update your training schedule.',this.modalRef,'loading',this.modalService,null);
    this.weeklyService.createSessionFromFile(file.trainingsessionFileMetaId).subscribe((res) => {
      if (res.header.status === 'success') {
        createModalref.title = "Session Created From File"
        this.updateWeek.next(createModalref);
        // CommonUtils.modalMessage('Success','Session created from file',this.modalRef,'success',this.modalService,'OK');
      }
      this.loading = false;
    }, (err) => {
      createModalref.modalRef.hide();
      CommonUtils.modalMessage('Error', err.error.body.response.msg || DEFAULT_ERROR_MESSAGE,this.modalRef,'error',this.modalService,'Try again');
      console.error(err);
      this.loading = false;
    });
  }

  linkToSession(file) {
    this.toastr.success('Fetching sessions to link the file to...');
    let linkModalref;
    this.weeklyService.fetchAllIncompleteSessions(file.trainingsessionFileMetaId, file.sessionType, file.dateTime).subscribe((res) => {
      if (res.header.status === 'success') {
        console.log(res.body.response);
        const initialState = {
          files: res.body.response
        };

        this.modalRef = this.modalService.show(LinkSessionComponent, { class: 'modal-lg', initialState });
        this.modalRef.content.displayModal = this.modalRef;
        this.modalRef.content.session.subscribe((session) => {
          console.log(session);

          if (session) {
            // this.toastr.success('linking...');
            linkModalref = CommonUtils.modalMessage('Linking File','Please wait while we link the file and update your training schedule.',this.modalRef,'loading',this.modalService,null);
            this.weeklyService.link(file.trainingsessionFileMetaId, session.sessionId).subscribe(res => {
              if (res.header.status === 'success') {
                linkModalref.title = "Linked To Session"
                this.updateWeek.next(linkModalref);
                // CommonUtils.modalMessage('Success','Linked to session',this.modalRef,'success',this.modalService,'OK');
              }
            }, (err) => {
              linkModalref.modalRef.hide();
              CommonUtils.modalMessage('Error', err.error.body.response.msg || DEFAULT_ERROR_MESSAGE,this.modalRef,'error',this.modalService,'Try again');
              console.error(err);
            });
          }
        });


      }
    }, (err) => {
      CommonUtils.modalMessage('Error', err.error.body.response.msg || DEFAULT_ERROR_MESSAGE,this.modalRef,'error',this.modalService,'Try again');
      console.error(err);
    });
  }

  linkAndMerge(file: any, sessions: any[]) {
    const initialState = {
      files: this._getMergeableSessions(file.sessionType, file.dateTime, sessions)
    };
    let linkAndMergeModalref;
    this.modalRef = this.modalService.show(LinkSessionComponent, { class: 'modal-lg', initialState });
    this.modalRef.content.displayModal = this.modalRef;
    this.modalRef.content.session.subscribe((session) => {
      if (session) {
        linkAndMergeModalref = CommonUtils.modalMessage('Linking File','Please wait while we link the file and update your training schedule.',this.modalRef,'loading',this.modalService,null);
        this.weeklyService.merge([file.trainingsessionFileMetaId], session.sessionId).subscribe(res => {
          if (res.header.status === 'success') {
            linkAndMergeModalref.title = "Linked To Session"
            this.updateWeek.next(linkAndMergeModalref);
            // CommonUtils.modalMessage('Success','Linked to session',this.modalRef,'success',this.modalService,'OK');
          }
        }, (err) => {
          linkAndMergeModalref.modalRef.hide();
          CommonUtils.modalMessage('Error', err.error.body.response.msg || DEFAULT_ERROR_MESSAGE,this.modalRef,'error',this.modalService,'Try again');
          console.error(err);
        });
      }
    });
  }

  deleteUnlinkedFile(file) {
    // this.toastr.success('Deleting the file...');
    let deleteModalref = CommonUtils.modalMessage('Deleting Unlinked File','Please wait while we delete unlinked file and update your training schedule.',this.modalRef,'loading',this.modalService,null);
    this.weeklyService.deleteUnlinkedFile(file.trainingsessionFileMetaId).subscribe((res) => {
      if (res.header.status === 'success') {
        deleteModalref.title = "File Deleted";
        this.updateWeek.next(deleteModalref);
        // CommonUtils.modalMessage('Success','File deleted',this.modalRef,'success',this.modalService,'OK');
      }
    }, (err) => {
      deleteModalref.modalRef.hide();
      CommonUtils.modalMessage('Error', err.error.body.response.msg || DEFAULT_ERROR_MESSAGE,this.modalRef,'error',this.modalService,'Try again');
      console.error(err);
    });
  }

  convertToHHMM(seconds) {
    const date = new Date(null);
    date.setSeconds(parseInt(seconds)); // specify value for SECONDS here
    return date.toISOString().substr(11, 5);
  }

  async unlinkFile(session) {
    // this.toastr.success('Unlinking...');
    let unlinkModalref;
    try {
      unlinkModalref = CommonUtils.modalMessage('Unlinking File','Please wait while we delete unlinked file and update your training schedule.',this.modalRef,'loading',this.modalService,null);
      await this.weeklyService.unlinkFile(session.sessionId).toPromise();
      unlinkModalref.title = "File Unlinked"
      this.updateWeek.next(unlinkModalref);
      // CommonUtils.modalMessage('Success','File unlinked',this.modalRef,'success',this.modalService,'OK');
    } catch (err) {
      unlinkModalref.modalRef.hide();
      CommonUtils.modalMessage('Error', err.error.body.response.msg || DEFAULT_ERROR_MESSAGE,this.modalRef,'error',this.modalService,'Try again');
      console.error(err);
    }
  }

  moveOrCopy(action, dayOrSession, data) {
    this.modalRef = this.modalService.show(MoveCopyComponent,{backdrop: 'static',
    keyboard: false});
    this.modalRef.content.MoveOrCopy = action;
    this.modalRef.content.dayOrSession = dayOrSession;
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.setDate.subscribe(selectedDate => {

      if (action === 'move') {
        
        this._move(selectedDate, dayOrSession, data);
      } else if (action === 'copy') {
        let copyModalref= CommonUtils.modalMessage('Copying Session','Please wait while we copy your session(s) and update your training schedule.',this.modalRef,'loading',this.modalService,null);
        const id = (dayOrSession === 'session') ? parseInt(data.sessionId) : this.week.phaseId;
        // this.toastr.success('Copying...');

        this.weeklyService.copy(data.date, this.extractDate(selectedDate), id, dayOrSession).subscribe(res => {
          console.log(res);
          copyModalref.title="Copy Complete";
          if (res.header.status === 'success') {
            this.updateWeek.next(copyModalref);
            
            // CommonUtils.modalMessage('Success','Session copied',this.modalRef,'success',this.modalService,'OK');
          }

        }, (err) => {          
          copyModalref.modalRef.hide();
          CommonUtils.modalMessage('Error', err.error.body.response.msg || DEFAULT_ERROR_MESSAGE,copyModalref.modalRef,'error',copyModalref.modalService,'Try again');
          console.error(err);
        });
      }
    });
  }

  private async _move(selectedDate, dayOrSession: 'session'|'day', data) {
    if(data){
    const id = (dayOrSession === 'session') ? data.sessionId==undefined?"": parseInt(data.sessionId) : this.week.phaseId;
    try {
      await this.weeklyService.move(data.date, this.extractDate(selectedDate), id, dayOrSession).toPromise();    
    } catch (err) {
      CommonUtils.modalMessage('Error', err.error.body.response.msg || DEFAULT_ERROR_MESSAGE,this.modalRef,'error',this.modalService,'Try again');
      console.error(err);
    }
  }
  }

  isMobile() {  
    return getWindowWidth(window) < MOBILE_WIDTH_THRESHOLD;
  }
  getDracula(){
    if(this.isMobile()){
      return null
    }else{
      return "single-week";
    }

  }
  ngOnInit() {
    if(!this.isMobile()){
      this.dragulaService.destroy('single-week'+this.number)
      this.dragulaService.createGroup('single-week'+this.number, {
        moves: (el, container, handle) => {
          return handle.className === 'drag-handle';
        },
        accepts: (el, target, source) => {
          // avoid dropping to the same date
          return target['dataset'].date !== source['dataset'].date;
        }
      });
      this.subs.add(this.dragulaService.drop('single-week')
        .subscribe(({el, target}) => {
  
          const findSession = (sessionId, week) => {
            for (const day of week.days) {
              for (const session of day.sessions) {
                if (session.sessionId === sessionId) {
                  return session;
                }
              }
            }
          };
          const session = findSession(el['dataset'].sessionid, this.week);
  
          this._move(target['dataset'].date, 'session', session);
        }));

    }

    this.isCoachAccess = this.localstorageService.getIsCoachAccess() ? true : false;
  }

  ngOnChanges({week}: SimpleChanges) {
    if (!week) {
      return;
    }
    this.week = week.currentValue;
    if (this.week.weekStart) {
      this.getWeekWorkload(this.week.weekStart);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.dragulaService.destroy('single-week');
  }

  shouldMoveBeEnabled(session) {
    return !session.actualTotal;
  }

  shouldRestoreBeEnabled(session) {
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
    if (session.actualTotal) {
      return false;
    }
    return session.sessionType !== 'strength';
  }

  shouldUnlinkBeEnabled(session) {
    return session.linkedFiles && session.linkedFiles.length > 0;
  }

  shouldMergeBeEnabled(file: any, sessions: any[]) {
    return sessions && this._getMergeableSessions(file.sessionType, file.dateTime, sessions).length;
  }

  private _getMergeableSessions(sessionType: string, fileDate: string, sessions: any[]) {
    return sessions.filter(session => (
      session.isLinkedFile === 'true' &&
      sessionType === session.sessionType &&
      moment(fileDate).isSame(session.date, 'day')
    ));
  }

  shouldRestoreBeEnabledDay(sessions: any[]) {
    return sessions && sessions.every(session => this.shouldRestoreBeEnabled(session));
  }

  canComplete(day) {
    return !moment(day.date).isAfter(moment());
  }

  getZoneClass(session, zone) {
    if (session.actualTotal > 0) {
      return '';
    }
    if (zone.zoneType === 'z1') {
      return 'z1';
    }
    if (zone.zoneType === 'z2') {
      return 'z2';
    }
    if (zone.zoneType === 'z3') {
      return 'z3';
    }
    if (zone.zoneType === 'z4') {
      return 'z4';
    }
    if (zone.zoneType === 'z5') {
      return 'z5';
    }
    if (zone.zoneType === 'z6') {
      return 'z6';
    }
  }

  getZoneWidth(session, zone) {
    const plannedSessionToatl = parseInt(session.plannedTotal);
    const zonePlannedTotal = parseInt(zone.planned);
    const total = (zonePlannedTotal / plannedSessionToatl) * 100;
    return '' + total + '%';
  }

  getZoneStyle(session, zone) {
    const plannedSessionToatl = parseInt(session.plannedTotal);
    const zonePlannedTotal = parseInt(zone.planned);
    const total = (zonePlannedTotal / plannedSessionToatl) * 100;

    let first = 0;
    let last = session.zones.length - 1;
    for (let index = 0; index < session.zones.length; index++) {
      const znPlanned = parseInt(session.zones[index].planned);
      if (znPlanned > 0) {
        first = index;
        break;
      }
    }

    for (let index = session.zones.length - 1; index >= 0; index--) {
      const znPlanned = parseInt(session.zones[index].planned);
      if (znPlanned > 0) {
        last = index;
        break;
      }
    }

    const style = {
      'width': total + '%',
      'border-bottom-left-radius': '0px',
      'border-bottom-right-radius': '0px'
    };

    if (zone.zoneType === session.zones[first].zoneType) {
      style['border-bottom-left-radius'] = '3px';
    }

    if (zone.zoneType === session.zones[last].zoneType) {
      style['border-bottom-right-radius'] = '3px';
    }
    return style;
  }

  isSessionDetailEmpty(input: string) {
    if (!input) {
      return true;
    }

    if ([
      /^\s*$/im,
      /^cd$/im,
      /^cool\s*down$/im,
      /^ms$/im,
      /^main\s*set$/im,
      /^wu$/im,
      /^warm\s*up$/im,
      /^n\\a$/im,
      ].some(x => !!input.trim().match(x))
    ) {
      return true;
    }

    return false;
  }
}
