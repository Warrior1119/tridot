import Debounce from 'debounce-decorator';
import { Component, Input, Output, EventEmitter, ViewEncapsulation, SimpleChanges, OnInit } from '@angular/core';
import { DEBOUNCE_INTERVAL_DEFAULT_MS } from '../../constants/constants';
import {TextEncodeDecode} from "../../common-model/textEncodeDecode.modal";

@Component({
  selector: 'app-race-x-survey',
  templateUrl: './race-x-survey.component.html',
  styleUrls: ['./race-x-survey.component.scss'],
})
export class RaceXSurveyComponent implements OnInit{

  @Input() race;
  @Input() details;
  @Input() showSubmitButton = false;
  @Output() updateRaceX = new EventEmitter();
  @Output() submit = new EventEmitter();

  local = {
    isFirstRaceOfDistance: '',
    qualifyingPerformance: '',
    qualifyingReason: '',
    validForAnalysis: '',
    dnsDnf: '',
    goal1Success: '',
    goal2Success: '',
    goal3Success: '',
    overallRaceSuccess:''
  };

  totalParticipantsError;
  totalMalesError;
  totalInDivisionError;
  overallRankError;
  genderRankError;
  divisionRankError;
  totalParticipantsCanEdit;
  totalParticipantsInGenderCanEdit;
  totalDivisionCanEdit;

  constructor(
    private textEncodeDecode:TextEncodeDecode,) { 

    }
   ngOnInit(){
    this.local.isFirstRaceOfDistance = { 1: 'YES', 0: 'NO' }[this.details.uiRaceDetails.isFirstRaceOfDistance];
    this.local.qualifyingPerformance = { 1: 'YES', 0: 'NO' }[this.details.uiRaceDetails.qualifyingPerformance];
    this.local.qualifyingReason = { 'na': 'N/A', 'professional': 'Professional', 'wc': 'World Championship', 'nc': 'National Championship', 'others': 'Others' }[this.details.uiRaceDetails.qualifyingReason];
    this.local.validForAnalysis = { 1: 'YES', 0: 'NO' }[this.details.uiRaceDetails.validForAnalysis];
    this.local.dnsDnf = { 'dns': 'DNS', 'dnf': 'DNF', 'neither': 'Neither' }[this.details.uiRaceDetails.dnsDnf];
    this.local.goal1Success = { 1: 'YES', 0: 'NO' }[this.details.uiRaceDetails.goal1Success];
    this.local.goal2Success = { 1: 'YES', 0: 'NO' }[this.details.uiRaceDetails.goal2Success];
    this.local.goal3Success = { 1: 'YES', 0: 'NO' }[this.details.uiRaceDetails.goal3Success];
    this.local.overallRaceSuccess = { 1: 'YES', 0: 'NO' }[this.details.uiRaceDetails.overallRaceSuccess];
    this.details.uiRaceDetails.comments = this.textEncodeDecode.getDecodedText(this.details.uiRaceDetails.comments);
    this.setParticipantAndDivisionEditability();
   }
  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateTotalParticipants(value: string) {
    if (!this._validateTotalParticipants(value)) {
      return;
    }
    this.update('totalParticipants', this.details.uiRaceDetails.totalParticipants);
  }

  private _validateTotalParticipants(value: string) {
    this.totalParticipantsError = null;
    if (!value) {
      return true;
    }
    if (parseInt(value) > 9999) {
      this.totalParticipantsError = 'No of participants cannot be more than 9999.';
      return false;
    }
    if (this.details.uiRaceDetails.overallRank && parseInt(value) < this.details.uiRaceDetails.overallRank) {
      this.totalParticipantsError = 'No of participants cannot be less than overall rank.';
      return false;
    }
    return true;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateTotalMales(value: string) {
    if (!this._validateTotalMales(value)) {
      return;
    }
    this.update('totalParticipantsInGender', this.details.uiRaceDetails.totalParticipantsInGender);
  }

  private _validateTotalMales(value: string) {
    this.totalMalesError = null;
    if (!value) {
      return true;
    }
    if (parseInt(value) > this.details.uiRaceDetails.totalParticipants) {
      this.totalMalesError = 'No of Gender participants cannot be more than no of participants.';
      return false;
    }
    if (this.details.uiRaceDetails.genderRank && parseInt(value) < this.details.uiRaceDetails.genderRank) {
      this.totalMalesError = 'no of participants cannot be less than gender rank.';
      return false;
    }
    return true;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateTotalInDivision(value: string) {
    if (!this._validateTotalInDivision(value)) {
      return;
    }
    this.update('totalInDivision', this.details.uiRaceDetails.totalInDivision);
  }

  private _validateTotalInDivision(value: string) {
    this.totalInDivisionError = null;
    if (!value) {
      return true;
    }
    if (parseInt(value) > this.details.uiRaceDetails.totalParticipantsInGender) {
      this.totalInDivisionError = 'No of participants in your division cannot be more than no of participants in your gender.';
      return false;
    }
    if (this.details.uiRaceDetails.divisionRank && parseInt(value) < this.details.uiRaceDetails.divisionRank) {
      this.totalInDivisionError = 'No of participants in division cannot be less than division rank.';
      return false;
    }
    return true;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateOverallRank(value: string) {
    if (!this._validateOverallRank(value)) {
      return;
    }
    this.update('overallRank', this.details.uiRaceDetails.overallRank);
  }

  private _validateOverallRank(value: string) {
    this.overallRankError = null;
    if (!value) {
      return true;
    }
    if (this.details.uiRaceDetails.totalParticipants && parseInt(value) > this.details.uiRaceDetails.totalParticipants) {
      this.overallRankError = 'Overall rank cannot be more than no of participants.';
      return false;
    }
    return true;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateGenderRank(value: string) {
    if (!this._validateGenderRank(value)) {
      return;
    }
    this.update('genderRank', this.details.uiRaceDetails.genderRank);
  }

  private _validateGenderRank(value: string) {
    this.genderRankError = null;
    if (!value) {
      return true;
    }
    if (this.details.uiRaceDetails.totalParticipantsInGender && parseInt(value) > this.details.uiRaceDetails.totalParticipantsInGender) {
      this.genderRankError = 'Gender rank cannot be more than no of participants.';
      return false;
    }
    return true;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateDivisionRank(value: string) {
    if (!this._validateDivisionRank(value)) {
      return;
    }
    this.update('divisionRank', this.details.uiRaceDetails.divisionRank);
  }

  private _validateDivisionRank(value: string) {
    this.divisionRankError = null;
    if (!value) {
      return true;
    }
    if (this.details.uiRaceDetails.totalInDivision && parseInt(value) > this.details.uiRaceDetails.totalInDivision) {
      this.divisionRankError = 'Division rank cannot be more than no of participants in division.';
      return false;
    }
    return true;
  }
  setParticipantAndDivisionEditability() {
    if (this.details && this.details.uiRaceDetails.isCustomRace == 1) {
      this.totalParticipantsCanEdit = true;
      this.totalParticipantsInGenderCanEdit = true;
      this.totalDivisionCanEdit = true;
    }
    else {
      this.totalParticipantsCanEdit = false;
      this.totalParticipantsInGenderCanEdit = false;
      this.totalDivisionCanEdit = false;
    }
  }
  getButtonClass(key,value){
    if(this.local[key] == value){
      return 'btn-primary'
    }
    return 'btn-default'
  }
  ngOnChanges(changes: SimpleChanges) {
    if (!changes.details) {
      return;
    }
    
    this.local.isFirstRaceOfDistance = { 1: 'YES', 0: 'NO' }[this.details.uiRaceDetails.isFirstRaceOfDistance];
    this.local.qualifyingPerformance = { 1: 'YES', 0: 'NO' }[this.details.uiRaceDetails.qualifyingPerformance];
    this.local.qualifyingReason = { 'na': 'N/A', 'professional': 'Professional', 'wc': 'World Championship', 'nc': 'National Championship', 'others': 'Others' }[this.details.uiRaceDetails.qualifyingReason];
    this.local.validForAnalysis = { 1: 'YES', 0: 'NO' }[this.details.uiRaceDetails.validForAnalysis];
    this.local.dnsDnf = { 'dns': 'DNS', 'dnf': 'DNF', 'neither': 'Neither' }[this.details.uiRaceDetails.dnsDnf];
    this.local.goal1Success = { 1: 'YES', 0: 'NO' }[this.details.uiRaceDetails.goal1Success];
    this.local.goal2Success = { 1: 'YES', 0: 'NO' }[this.details.uiRaceDetails.goal2Success];
    this.local.goal3Success = { 1: 'YES', 0: 'NO' }[this.details.uiRaceDetails.goal3Success];
    this.local.overallRaceSuccess = { 1: 'YES', 0: 'NO' }[this.details.uiRaceDetails.overallRaceSuccess];
    this.details.uiRaceDetails.comments = this.textEncodeDecode.getDecodedText(this.details.uiRaceDetails.comments);
    this.setParticipantAndDivisionEditability();
  }

  update(key: string, value) {
    if(key=='comments'){
      value = this.textEncodeDecode.getEncodedText(value);
    }
    this.updateRaceX.next({
      [key]: value,
      raceId: this.race.raceId,
      athleteId: this.race.athleteId,
    });
  }

}
