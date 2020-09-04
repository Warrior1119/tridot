import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import * as moment from 'moment';
import { WAIT_AFTER_LAST_KEY_PRESSED_MS, DEFAULT_ERROR_MESSAGE } from '../../../../../constants/constants';
import Debounce from 'debounce-decorator';
import { WeeklySummaryService } from '../../weekly-summary.service';
import { CommonUtils } from '../../../../../common-util/common-utils';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

const SESSION_TYPES = ['Blank Session', 'TriDot Session'];

@Component({
  selector: 'app-coach-create-session',
  templateUrl: './coach-create-session.component.html',
  styleUrls: ['./coach-create-session.component.scss']
})
export class CoachCreateSessionComponent implements OnInit {
  @Input() session: any;
  @Input() newlySelectedSessionType: string;
  @Input() day: any;
  @Input() date: string;
  @Input() phaseId: any;
  @Input() addNewSessionToggled: boolean;
  @Output() sessionChange = new EventEmitter();
  @Output() addNewSessionToggledChange = new EventEmitter();

  modalRef: BsModalRef;
  sessionTimeError;
  plannedTimeEdit = false;
  busy = false;
  sessionTypes = SESSION_TYPES;
  selectedSessionType;
  zoneForAdd = [];
  selectedZone;
  selectedSessionStack = undefined;
  sessionStacks = [];
  newSession = {
    actualTotal: "",
    athleteId: 5028,
    date: "09/03/2019",
    dayName: null,
    isAthleteCreated: false,
    isCoachAdjusted: "",
    isCoachCreated: true,
    isSystemGenerated: false,
    phaseId: 223350,
    plannedTotal: null,
    sessionLevel: "0",
    sessionName: "SWIM",
    sessionStackId: "B.RaceWeek.1",
    sessionStackName: "Race Week Ride",
    sessionTime: "05:00AM",
    sessionType: "SWIM",
    warmUpDuration: null,
    warmUpImpact: undefined,
    location: null,
    sessionDetail: {'coolDown': undefined, 'mainSet': undefined, 'warmUp': undefined}
  }


  constructor(
    private weeklyService: WeeklySummaryService,
    private modalService: BsModalService,
  ) { }
  ngOnChanges(changes: SimpleChanges){
    console.log(changes)
    if(changes.newlySelectedSessionType ){
      this.getSessionStacks();
    }
  }
  setSelectedSessionType(type: string) {
    this.selectedSessionType = type;
    this.getSessionStacks();
  }
  setSelectedZone(zone) {
    this.selectedZone = zone;
    this.getSessionStacks();
  }
  async update() {
    let updatedObj;
    switch (this.session.sessionType.toUpperCase()) {
      case "SWIM":
       updatedObj={
        plannedTotal: this.session.plannedTotal,
        warmUpDuration: this.session.warmUpDuration,
        sessionLevel: this.session.sessionLevel,
        isCoachAdjusted: true
       }

        break;
      case "BIKE":
          updatedObj={
            plannedTotal: this.session.plannedTotal,
            sessionLevel: this.session.sessionLevel,
            isCoachAdjusted: true
           }

        break;
      case "RUN":
          updatedObj={
            plannedTotal: this.session.plannedTotal,
            warmUpImpact: this.session.warmUpImpact,
            sessionLevel: this.session.sessionLevel,
            isCoachAdjusted: true,
           }

        break;
      case "STRENGTH":
          updatedObj={
            plannedTotal: this.session.plannedTotal,
            sessionLevel: this.session.sessionLevel,
            isCoachAdjusted: true
           }
        break;
      case "OTHER":
          updatedObj={
            plannedTotal: this.session.plannedTotal,
            sessionLevel: this.session.sessionLevel,
            isCoachAdjusted: true
           }
        break;
      default:
        break;
    }
    const modal = CommonUtils.modalMessage('Saving session', 'Please wait while we are saving the new session', this.modalRef, 'loading', this.modalService, null);
    try {
      this.busy = true;
      await this.weeklyService.updateDayData(updatedObj, this.session.sessionId);
      this.sessionChange.emit(this.day);
    } catch (err) {
      CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg || DEFAULT_ERROR_MESSAGE, this.modalRef, 'error', this.modalService, 'Dismiss');
    } finally {
      this.busy = false;
      modal.modalRef.hide();
    }
  }
  createBlankSession() {
    this.newSession.plannedTotal = 0;
    this.newSession.sessionType = this.newlySelectedSessionType;
    this.newSession.date = this.date;
    this.newSession.phaseId = this.phaseId;
    console.log(this.newlySelectedSessionType);
    const modal = CommonUtils.modalMessage('Creating session', 'Please wait while we are adding the new session', this.modalRef, 'loading', this.modalService, null);

    this.weeklyService.addCoachBlankSession(this.newSession)
      .toPromise()
      .then((res) => {
        modal.modalRef.hide();
        if (res.header.status === 'success') {
          CommonUtils.modalMessage('Added New Session', '', this.modalRef, 'success', this.modalService, 'View Session', true);
          this.sessionChange.emit(this.day);
          this.close();
        } else {
          CommonUtils.modalMessage('Error', res && res.body && res.body.response && res.body.response.msg || DEFAULT_ERROR_MESSAGE, this.modalRef, 'error', this.modalService, 'Dismiss');
        }
      })
      .catch((err) => {
        modal.modalRef.hide();
        CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg || DEFAULT_ERROR_MESSAGE, this.modalRef, 'error', this.modalService, 'Dismiss');
      });
  }

  createTridotSession() {
    this.newSession.sessionName = this.newlySelectedSessionType;
    this.newSession.sessionType = this.newlySelectedSessionType;
    this.newSession.sessionStackId = this.selectedSessionStack.lookupName;
    this.newSession.sessionStackName = this.selectedSessionStack.name;
    this.newSession.plannedTotal = this.newSession.plannedTotal == null ? 0 : this.newSession.plannedTotal;
    this.newSession.date = this.date;
    this.newSession.phaseId = this.phaseId;
    console.log("new session " + JSON.stringify(this.newSession));
    let modal = CommonUtils.modalMessage('Creating session', 'Please wait while we are adding the new session', this.modalRef, 'loading', this.modalService, null);

    this.weeklyService.addCoachTridotSession(this.newSession)
      .toPromise()
      .then((res) => {
        modal.modalRef.hide();
        if (res.header.status === 'success') {
          CommonUtils.modalMessage('Added New Session', '', this.modalRef, 'success', this.modalService, 'View Session', true);
          this.sessionChange.emit(this.day);
          this.close();
        } else {
          CommonUtils.modalMessage('Error', res && res.body && res.body.response && res.body.response.msg || DEFAULT_ERROR_MESSAGE, this.modalRef, 'error', this.modalService, 'Dismiss');
        }
      })
      .catch((err) => {
        modal.modalRef.hide();
        CommonUtils.modalMessage('Error', err && err.body && err.body.response && err.body.response.msg || DEFAULT_ERROR_MESSAGE, this.modalRef, 'error', this.modalService, 'Dismiss');
      });
  }

  async getSessionStacks() {
    this.selectedSessionStack = undefined;
    if(this.selectedZone){
      this.sessionStacks = await this.weeklyService.getSessionStacks(this.selectedZone.zoneId, this.newlySelectedSessionType)
      return this.sessionStacks;
    }
    return [];
  }

  decreaseWarmupDuration() {
    console.log(this.session)
    if (this.session.warmUpDuration > 0) {
      this.session.warmUpDuration = parseInt(this.session.warmUpDuration) - 5;
    }

  }
  increaseWarmupDuration() {
    if (this.session.warmUpDuration < 15) {
      this.session.warmUpDuration = parseInt(this.session.warmUpDuration) + 5;
    }
  }
  increaseLevel() {
    if (this.addNewSessionToggled && parseInt(this.newSession.sessionLevel)  < 10) {
     this.newSession.sessionLevel =""+(parseInt(this.newSession.sessionLevel)+1);
    }
    else if(parseInt(this.session.sessionLevel)  < 10){
      this.session.sessionLevel =""+(parseInt(this.session.sessionLevel)+1);
    }
  }
  decreaseLevel() {
    if (this.addNewSessionToggled && parseInt(this.newSession.sessionLevel)  > 0) {
      this.newSession.sessionLevel =""+(parseInt(this.newSession.sessionLevel)-1);
     }
     else if(parseInt(this.session.sessionLevel)  > 0){
       this.session.sessionLevel =""+(parseInt(this.session.sessionLevel)-1);
     }
  }
  getSessionTime(input: string) {
    const parsed = moment(input, 'hh:mm');
    if (!parsed.isValid()) {
      return '--:--';
    }
    return parsed.format('hh:mm');
  }
  convertToHHMM(seconds) {
    if (seconds === null) {
      return '--:--';
    }
    const date = new Date(null);
    date.setSeconds(parseInt(seconds));// specify value for SECONDS here
    return date.toISOString().substr(11, 5);
  }

  incrementPlannedTotal() {
      this.session.plannedTotal = parseInt(this.session.plannedTotal) + 5 * 60;
  }

  decrementPlannedTotal() {
    this.session.plannedTotal = parseInt(this.session.plannedTotal) - 5 * 60;
  }

  convertWarmUpToHHMM(min) {
    const date = new Date(null);
    date.setMinutes(parseInt(min))
    if (min === null || min == '0') {
      return '00:00';
    }

    return min < 10 ? '0:0' + min : '0:' + min;
  }

  //sample  body
  // body:
  // actualTotal: ""
  // athleteId: 5028
  // date: "09/03/2019"
  // dayName: null
  // isAthleteCreated: false
  // isCoachAdjusted: ""
  // isCoachCreated: true
  // isSystemGenerated: false
  // phaseId: 223350
  // plannedTotal: 0
  // sessionLevel: ""
  // sessionName: "BIKE"
  // sessionStackId: "B.RaceWeek.1"
  // sessionStackName: "Race Week Ride"
  // sessionTime: "05:00AM"
  // sessionType: "BIKE"
  // warmUpDuration: null
  // warmUpImpact: undefined



  // actualTotal: ""
  // athleteId: 5028
  // date: "09/03/2019"
  // dayName: null
  // isAthleteCreated: false
  // isCoachAdjusted: ""
  // isCoachCreated: true
  // isSystemGenerated: false
  // phaseId: 223350
  // plannedTotal: 3000
  // sessionLevel: 5
  // sessionName: "SWIM"
  // sessionStackId: "S.RW"
  // sessionStackName: "Race Week Swim"
  // sessionTime: "05:00AM"
  // sessionType: "SWIM"
  // warmUpDuration: 10
  // warmUpImpact: undefined
  @Debounce(WAIT_AFTER_LAST_KEY_PRESSED_MS)
  updatePlannedTime(input: string) {
    this.sessionTimeError = null;
    if (!input) {
      this.sessionTimeError = 'Start time is required';
      return;
    }
    // if (false) {
    //   this.sessionTimeError = 'Start time should be in format HH:MM AM/PM';
    //   return;
    // }
    const plannedTotal = moment(input, 'hh:mm').format('hh:mm');


    if (this.session.plannedTotal != plannedTotal) {
      this.session.plannedTotal = parseInt(plannedTotal.substr(0, 2)) * 3600 + parseInt(plannedTotal.substr(3)) * 60;
    }

  }

  async getSessionZonesForAdd() {
    this.zoneForAdd = await this.weeklyService.getSessionZonesForAdd();
  }

  async ngOnInit() {
    await this.getSessionZonesForAdd();
    this.setSelectedZone(this.zoneForAdd[0]);
    this.setSelectedSessionType(SESSION_TYPES[0]);
  }

  close() {
    this.setSelectedZone(this.zoneForAdd[0]);
    this.setSelectedSessionType(SESSION_TYPES[0]);
    this.addNewSessionToggled = false;
    this.addNewSessionToggledChange.emit(this.addNewSessionToggled);
  }

}
