import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { WeeklySummaryService } from '../../weekly-summary.service';
import { DEFAULT_ERROR_MESSAGE } from '../../../../../constants/constants';
import { UnlinkedFilesComponent } from '../session-list/unlinked-files/unlinked-files.component';
import { LinkSessionComponent } from '../../single-week/link-session/link-session.component';

@Component({
  selector: 'app-session-complete-controls',
  templateUrl: './session-complete-controls.component.html',
  styleUrls: ['./session-complete-controls.component.scss']
})
export class SessionCompleteControlsComponent implements OnChanges {

  
  @Input() day: any;
  @Input() selectedSessionId: string;
  @Input() phaseId: string;
  @Input() isCoachAccess: boolean;
  @Input() addNewSessionToggled: boolean;
  @Output() sessionChange = new EventEmitter();
  @Output() prevDay = new EventEmitter();
  @Output() nextDay = new EventEmitter();
  @Output() action = new EventEmitter();
  @Output() metrics = new EventEmitter();
  @Output() metricsEdit = new EventEmitter();
  @Output() moveOrCopy = new EventEmitter();
  @Output() add = new EventEmitter();
  @Output() restore = new EventEmitter();
  @Output() newSelectedSessionType = new EventEmitter();
  
  session;
  modalRef: BsModalRef;
  loading = false;
  isLinkedFileBusy = {};
  selectedSessionType = 'SWIM';
  
  get sessionId() { return this.session && this.session.sessionId; }
  get sessionName() { return this.session && this.session.sessionZoneLabel && this.session.sessionZoneLabel.toLowerCase(); }

  constructor(
    private weeklyService: WeeklySummaryService,
    private modalService: BsModalService,
    private toastr: ToastrService,
  ) {}
  
  getIcon(path,sessionType){
    switch (sessionType.toLowerCase()) {
      case 'swim':
              if(this.selectedSessionType.toLowerCase() == 'swim'){
                return path + '-blue.svg'
              }
              return path + '.svg' 
      
      case 'run':
          if(this.selectedSessionType.toLowerCase() == 'run'){
            return path + '-green.svg'
          }
          return path + '.svg' 
      case 'strength':
          if(this.selectedSessionType.toLowerCase() == 'strength'){
            return path + '-black.svg'
          }
          return path + '.svg' 
      case 'bike':
          if(this.selectedSessionType.toLowerCase() == 'bike'){
            return path + '-orange.svg'
          }
          return path + '.svg' 
      default:
        break;
    }
    
  }
  sessionDetails(session) {
    this.session = session;
    this.sessionChange.emit(session);
  }

  ngOnChanges(changes: SimpleChanges) {
    const day = changes.day && changes.day.currentValue;
    if (day && day.noData) {
      this.session = null;
    }

    // if (!day || !day.sessions || !day.sessions.length) {
    //   return;
    // }

    const selectedSessionId = changes.selectedSessionId && changes.selectedSessionId.currentValue;
    // Do not delete the following lines!
    // This code is needed for refreshing envionmental & zones data,
    // when user updates time or/and location
    console.info('Requesting weather data'); 
    if (this.day.sessions) {
      const session = this.day.sessions.find(sess => sess.sessionId === selectedSessionId);
      this.sessionDetails(session || this.day.sessions[0]);
    }

    // When 'X' is clicked
    if (
      changes.addNewSessionToggled && changes.addNewSessionToggled.previousValue 
    && !changes.addNewSessionToggled.currentValue
    ) {
      this.selectedSessionType = 'swim';
    }
  }

  shouldRestoreBeEnabled(session) {
    return session.isFromDifferentWeek == 'true';
  }

  shouldRestoreBeEnabledDay(sessions: any[]) {
    return sessions && sessions.every(session => this.shouldRestoreBeEnabled(session));
  }

  shouldAddBeEnabledDay(sessions) {
    if (this.isCoachAccess) {
      return false;
    }
    return sessions && sessions.length || this.phaseId;
  }

  showUnlinkedModal() {
    const initialState = {
      files: this.day.unlinkedFiles
    };
    this.modalRef = this.modalService.show(UnlinkedFilesComponent, { class: 'modal-lg', initialState });
    this.modalRef.content.displayModal = this.modalRef;
    this.modalRef.content.decision.subscribe(({action, file}) => {
      switch (action) {
        case 'delete':
          this.deleteUnlinkedFile(file);
          break;
        case 'link':
          this.linkToSession(file);
          break;
        case 'create':
          this.createSession(file)
          break;
      }
    })
  }

  createSession(file) {
    if (this.loading) {
      return;
    }

    // this.toastr.success('Creating Session From File...');
    this.loading = true;
    this.isLinkedFileBusy[file.trainingsessionFileMetaId] = true;
    this.weeklyService.createSessionFromFile(file.trainingsessionFileMetaId).subscribe((res) => {
      if (res.header.status === 'success') {
        this.toastr.success('Session Has Been Created!');
        this.sessionChange.next(-1);
      }
      this.loading = false;
      this.isLinkedFileBusy[file.trainingsessionFileMetaId] = false;
    }, (err) => {
      this.toastr.error(err && err.body && err.body.response && err.body.response.msg || DEFAULT_ERROR_MESSAGE);
      this.loading = false;
      this.isLinkedFileBusy[file.trainingsessionFileMetaId] = false;
    });
  }


  linkToSession(file) {
    this.toastr.success('Fetching sessions to link the file to...');
    this.isLinkedFileBusy[file.trainingsessionFileMetaId] = true;
    this.weeklyService.fetchAllIncompleteSessions(file.trainingsessionFileMetaId, file.sessionType, file.dateTime).subscribe(res => {
      if (res.header.status !== 'success') {
        this.isLinkedFileBusy[file.trainingsessionFileMetaId] = false;
        this.toastr.success('Failed');
      } else {

        const initialState = {
          files: res.body.response
        };

        this.modalRef = this.modalService.show(LinkSessionComponent, { class: 'modal-lg', initialState });
        this.modalRef.content.displayModal = this.modalRef;
        this.modalRef.content.session.subscribe(session => {
          if (!session) {
            this.isLinkedFileBusy[file.trainingsessionFileMetaId] = false;
          } else {
            // this.toastr.success('linking...');
              
            this.weeklyService.link(file.trainingsessionFileMetaId, session.sessionId).subscribe(resp => {
              if (resp.header.status === 'success') {
                this.toastr.success('File has been linked');
                this.sessionChange.next(resp.body.response.newlyGeneratedId);
                this.toastr.success('Done');
              }
              this.isLinkedFileBusy[file.trainingsessionFileMetaId] = false;
              this.toastr.success(DEFAULT_ERROR_MESSAGE);
            }, (err) => {
              this.isLinkedFileBusy[file.trainingsessionFileMetaId] = false;
              this.toastr.error(err && err.body && err.body.response && err.body.response.msg || DEFAULT_ERROR_MESSAGE);
            });
          }
        });
      }
    }, (err) => {
      this.toastr.error(err && err.body && err.body.response && err.body.response.msg || DEFAULT_ERROR_MESSAGE);
      this.isLinkedFileBusy[file.trainingsessionFileMetaId] = false;
    });
  }

  deleteUnlinkedFile(file) {
    // this.toastr.success('Deleting the file...');
    this.isLinkedFileBusy[file.trainingsessionFileMetaId] = true;
    this.weeklyService.deleteUnlinkedFile(file.trainingsessionFileMetaId).subscribe((res) => {
      if (res.header.status !== 'success') {
        this.isLinkedFileBusy[file.trainingsessionFileMetaId] = false;
        this.toastr.success(DEFAULT_ERROR_MESSAGE);
      } else {
        this.toastr.success('File Has Been Deleted!');
        this.sessionChange.next(this.sessionId);
        this.isLinkedFileBusy[file.trainingsessionFileMetaId] = false;
      }
    }, (err) => {
      this.toastr.error(err && err.body && err.body.response && err.body.response.msg || DEFAULT_ERROR_MESSAGE);
      this.isLinkedFileBusy[file.trainingsessionFileMetaId] = false;
    });
  }
}
