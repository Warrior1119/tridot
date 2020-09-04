import Debounce from 'debounce-decorator';
import * as moment from 'moment';
import { Component, Input, Output, EventEmitter, ViewEncapsulation, OnInit, SimpleChanges, getDebugNode } from '@angular/core';
import { calorie_form, calorie_source, DEBOUNCE_INTERVAL_DEFAULT_MS, TIME_MASK_PATTERN } from '../../constants/constants';
import { Animations } from '../../constants/animations';
import { SeasonPlannerService } from '../../season-planner/season-planner.service';
import { splitRanges, fluid } from './race-x-main';
import { isMobileSafari } from '../../../utils/browser';
import {TextEncodeDecode} from '../../common-model/textEncodeDecode.modal';
import { BrowserScrollService } from '../../../utils/browser-scroll-service';

type DistanceElement = 'swim' | 'bike' | 'run' | null;
type ElevationElement = | 'bike' | 'run' | null;

const ELEVATION_VALIDATION_RANGES = {
  'ft': [0, 15000],
  'm': [0, 4572],
};

const DISTANCE_VALIDATION_RANGES = {
  'swim': {
    'm': [100, 4000],
    'yds': [109, 4375],
    'km': [0.1, 4],
    'mi': [0.07, 2.5],
  },
  'bike': {
    'm': [5000, 200000],
    'yds': [5468, 218723],
    'km': [5, 200],
    'mi': [3, 125],
  },
  'run': {
    'm': [2000, 45000],
    'yds': [2187, 49213],
    'km': [2, 45],
    'mi': [1, 29],
  },
};

@Component({
  selector: 'app-race-x-main',
  templateUrl: './race-x-main.component.html',
  styleUrls: ['./race-x-main.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [ Animations.NgIf.ngIfExpandHeight ],
})
export class RaceXMainComponent implements OnInit {

  timePattern = TIME_MASK_PATTERN;

  @Input() loading;
  @Input() race;
  @Input() details;
  @Input() nutrition;
  @Input() showBottomSurvey;
  @Input() surveyFilled;
  @Input() hasNextRace = false;
  @Input() hasPrevRace = false;
  @Output() updateRaceX = new EventEmitter();
  @Output() nextRace = new EventEmitter();
  @Output() prevRace = new EventEmitter();
  
  comments = { swim: false, bike: false, run: false };
  bikeSiteSwitched: boolean = false;
  displayNutrition;
  calorie_form = calorie_form;
  calorie_source = calorie_source;
  currentPlan;
  splitRanges = splitRanges;
  fluid;
  local = {
    selectedBikeName: '',
    primaryCalorieFormActual: '',
    primaryCalorieSourceActual: '',
    isFirstRaceOfDistance: '',
    qualifyingPerformance: '',
    qualifyingReason: '',
    validForAnalysis: '',
    dnsDnf: '',
    goal1Success: '',
    goal2Success: '',
    goal3Success: '',
    overallRaceSuccess:'',
  };

  distanceHoveredElement: DistanceElement;
  distanceUnitHoveredElement: DistanceElement;
  elevationHoveredElement: ElevationElement;
  distanceUnit = '';
  commentsPlannedBikeVisible = false;
  commentsPlannedRunVisible = false;
  isActualSBTransitionTimeRequired = false;
  isActualBRTransitionTimeRequired = false;
  isActualSBTransitionTimeError: string;
  isActualBRTransitionTimeError: string;
  actualSwimError;
  actualBikeError;
  actualRunError;
  swimOverallRankError;
  swimGenderRankError;
  swimDivisionRankError;
  bikeOverallRankError;
  bikeGenderRankError;
  bikeDivisionRankError;
  runOverallRankError;
  runGenderRankError;
  runDivisionRankError;
  caloriesPlannedSwimError;
  caloriesPlannedBikeError;
  caloriesPlannedRunError;
  caloriesActualSwimError;
  caloriesActualBikeError;
  caloriesActualRunError;
  fluidsPlannedSwimError;
  fluidsPlannedBikeError;
  fluidsPlannedRunError;
  fluidsActualSwimError;
  fluidsActualBikeError;
  fluidsActualRunError;
  sodiumPlannedSwimError;
  sodiumPlannedBikeError;
  sodiumPlannedRunError;
  sodiumActualSwimError;
  sodiumActualBikeError;
  sodiumActualRunError;

  distanceErrors = {} as any;
  elevationErrors = {} as any;

  constructor(
    private seasonPlannerService: SeasonPlannerService,
    private textEncodeDecode: TextEncodeDecode,
    private browserScrollService: BrowserScrollService,
  ) {}

  moveActualSwim() {
    this._moveActual('');
  }
  moveActualBike() {
    this._moveActual('Bike');
  }
  moveActualRun() {
    this._moveActual('Run');
  }

  private _moveActual(type: string) {
      if (!['', 'Bike', 'Run'].includes(type)) {
        throw `Invalid type '${type}'`;
      }
      this.nutrition['sodiumActual' + type] = this.nutrition['sodiumPlanned' + type];
      this.nutrition['fluidsActual'+type] = this.nutrition['fluidsPlanned'+type];
      this.nutrition['caloriesActual'+type] = this.nutrition['caloriesPlanned'+type];
      this.nutrition['nutritionNotesActual'+type] = this.nutrition['nutritionNotesPlanned'+type];
      if (this.nutrition['primaryCalorieSourcePlanned'+type]) {
        this.nutrition['primaryCalorieSourceActual'+type] = this.nutrition['primaryCalorieSourcePlanned'+type];
        this.local['primaryCalorieSourceActual'+type] = this.getSource(this.nutrition['primaryCalorieSourceActual'+type]);
      } 

      if (this.nutrition['primaryCalorieFormPlanned'+type]) {
        this.nutrition['primaryCalorieFormActual'+type] = this.nutrition['primaryCalorieFormPlanned'+type];
        this.local['primaryCalorieFormActual'+type] = this.getForm(this.nutrition['primaryCalorieFormActual'+type]);
      }

      const data = {
        updateNutrition: 'true',
        nutritionId: this.nutrition.id || 0,
        raceId: this.race.raceId,
        athleteId: this.race.athleteId,
      };

      data['sodiumActual'+ type] = this.nutrition['sodiumActual'+type]
      data['fluidsActual'+ type] = this.nutrition['fluidsActual'+type]
      data['caloriesActual'+ type] = this.nutrition['caloriesActual'+type]
      data['primaryCalorieSourceActual'+ type] = this.nutrition['primaryCalorieSourceActual'+type]
      data['primaryCalorieFormActual'+ type] = this.nutrition['primaryCalorieFormActual'+type]

      this.updateRaceX.next(data);
  }

  getBikeName(id) {
    const bike = this.details.athleteProfile.bikes.find(bike => bike.bikeId == id);
    return (bike && bike.nickName) || this.getDefaultBikeName();
  }

  getDefaultBikeName() {
    const defaultBike = this.details.athleteProfile.bikes.find(x => x.active && x.bikeForRacing) || this.details.athleteProfile.bikes[0];
    return defaultBike && defaultBike.nickName;
  }

  getSource(value) {
    return this.calorie_source.filter(calorie => calorie.value.toString() == value)[0].name;
  }

  getForm(value) {
    return this.calorie_form.filter(calorie => calorie.value.toString() == value)[0].name;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateActualSBTransitionTime(value: string) {
    this.isActualSBTransitionTimeError = null;
    if (!value && this.isActualSBTransitionTimeRequired) {
      this.isActualSBTransitionTimeError = 'required';
      return;
    }
    if (!value.match(/^\d\d:\d\d:\d\d$/)) {
      this.isActualSBTransitionTimeError = 'format';
      return;
    }
    if (value > '00:59:59' || !moment(value, 'hh:mm:ss').isValid()) {
      this.isActualSBTransitionTimeError = 'Time should be between 00:00 and 59:59';
      return;
    }
    if (value === this.details.uiRaceDetails.actualSBTransitionTime) {
      return;
    }
    this.details.uiRaceDetails.actualSBTransitionTime = value;
    this.update('actualSBTransitionTime', value ,'');
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateActualBRTransitionTime(value: string) {
    this.isActualBRTransitionTimeError = null;
    if (!value && this.isActualBRTransitionTimeRequired) {
      this.isActualBRTransitionTimeError = 'required';
      return;
    }
    if (!value.match(/^\d\d:\d\d:\d\d$/)) {
      this.isActualBRTransitionTimeError = 'format';
      return;
    }
    if (value > '00:59:59' || !moment(value, 'hh:mm:ss').isValid()) {
      this.isActualBRTransitionTimeError = 'Time should be between 00:00 and 59:59';
      return;
    }
    if (value === this.details.uiRaceDetails.actualBRTransitionTime) {
      return;
    }
    this.details.uiRaceDetails.actualBRTransitionTime = value;
    this.update('actualBRTransitionTime', value, '');
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateActualSwim(value: string) {
    this.details.uiRaceDetails.actualSwim = value;
    if (!this._validateActualSwim(value)) {
      return;
    }
    this.update('actualSwim', this.details.uiRaceDetails.actualSwim, '');
  }

  private _validateActualSwim(value: string) {
    this.actualSwimError = null;
    if (!value) {
      return false;
    }
    if (value.length < 8 || !moment(value, 'hh:mm:ss').isValid()) {
      return false;
    }
    const range = this.splitRanges.find(ranges => (ranges.type === this.race.raceDistanceName)).ranges[0];
    if (value > range.to) {
      this.actualSwimError = 'Time should be between ' + range.from + ' and ' + range.to;
      return false;
    }
    return true;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateActualBike(value: string) {
    this.details.uiRaceDetails.actualBike = value;
    if (!this._validateActualBike(value)) {
      return;
    }
    this.update('actualBike', this.details.uiRaceDetails.actualBike, '');
  }

  private _validateActualBike(value: string) {
    this.actualBikeError = null;
    if (!value) {
      return false;
    }
    if (value.length < 8 || !moment(value, 'hh:mm:ss').isValid()) {
      return false;
    }
    const range = this.splitRanges.find(ranges => (ranges.type === this.race.raceDistanceName)).ranges[1];
    if (value > range.to) {
      this.actualBikeError = 'Time should be between ' + range.from + ' and ' + range.to;
      return false;
    }
    return true;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateActualRun(value: string) {
    this.details.uiRaceDetails.actualRun = value;
    if (!this._validateActualRun(value)) {
      return;
    }
    this.update('actualRun', this.details.uiRaceDetails.actualRun, '');
  }

  private _validateActualRun(value: string) {
    this.actualRunError = null;
    if (!value) {
      return false;
    }
    if (value.length < 8 || !moment(value, 'hh:mm:ss').isValid()) {
      return false;
    }
    const range = this.splitRanges.find(ranges => (ranges.type === this.race.raceDistanceName)).ranges[2];
    if (value > range.to) {
      this.actualRunError = 'Time should be between ' + range.from + ' and ' + range.to;
      return false;
    }
    return true;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateSwimOverallRank(value: string) {
    if (!this._validateSwimOverallRank(value)) {
      return;
    }
    this.update('swimOverallRank', this.details.uiRaceDetails.swimOverallRank, '');
  }

  private _validateSwimOverallRank(value: string) {
    this.swimOverallRankError = null;
    if (!value) {
      return true;
    }
    if (this.details.uiRaceDetails.totalParticipants && parseInt(value) > this.details.uiRaceDetails.totalParticipants) {
      this.swimOverallRankError = 'Swim overall rank cannot be more then no of participants';
      return false;
    }
    return true;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateSwimGenderRank(value: string) {
    if (!this._validateSwimGenderRank(value)) {
      return;
    }
    this.update('swimGenderRank', this.details.uiRaceDetails.swimGenderRank, '');
  }

  private _validateSwimGenderRank(value: string) {
    this.swimGenderRankError = null;
    if (!value) {
      return true;
    }
    if (this.details.uiRaceDetails.totalParticipantsInGender && parseInt(value) > this.details.uiRaceDetails.totalParticipantsInGender) {
      this.swimGenderRankError = 'Swim gender rank cannot be more then no of participants';
      return false;
    }
    return true;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateSwimDivisionRank(value: string) {
    if (!this._validateSwimDivisionRank(value)) {
      return;
    }
    this.update('swimDivisionRank', this.details.uiRaceDetails.swimDivisionRank, '');
  }

  private _validateSwimDivisionRank(value: string) {
    this.swimDivisionRankError = null;
    if (!value) {
      return true;
    }
    if (this.details.uiRaceDetails.totalInDivision && parseInt(value) > this.details.uiRaceDetails.totalInDivision) {
      this.swimDivisionRankError = 'Swim division rank cannot be more then no of participants in division';
      return false;
    }
    return true;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateBikeOverallRank(value: string) {
    if (!this._validateBikeOverallRank(value)) {
      return;
    }
    this.update('bikeOverallRank', this.details.uiRaceDetails.bikeOverallRank, '');
  }

  private _validateBikeOverallRank(value: string) {
    this.bikeOverallRankError = null;
    if (!value) {
      return true;
    }
    if (this.details.uiRaceDetails.totalParticipants && parseInt(value) > this.details.uiRaceDetails.totalParticipants) {
      this.bikeOverallRankError = 'Bike overall rank cannot be more then no of participants';
      return false;
    }
    return true;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateBikeGenderRank(value: string) {
    if (!this._validateBikeGenderRank(value)) {
      return;
    }
    this.update('bikeGenderRank', this.details.uiRaceDetails.bikeGenderRank, '');
  }

  private _validateBikeGenderRank(value: string) {
    this.bikeGenderRankError = null;
    if (!value) {
      return true;
    }
    if (this.details.uiRaceDetails.totalParticipantsInGender && parseInt(value) > this.details.uiRaceDetails.totalParticipantsInGender) {
      this.bikeGenderRankError = 'Bike gender rank cannot be more then no of participants';
      return false;
    }
    return true;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateBikeDivisionRank(value: string) {
    if (!this._validateBikeDivisionRank(value)) {
      return;
    }
    this.update('bikeDivisionRank', this.details.uiRaceDetails.bikeDivisionRank, '');
  }

  private _validateBikeDivisionRank(value: string) {
    this.bikeDivisionRankError = null;
    if (!value) {
      return true;
    }
    if (this.details.uiRaceDetails.totalInDivision && parseInt(value) > this.details.uiRaceDetails.totalInDivision) {
      this.bikeDivisionRankError = 'Bike division rank cannot be more then no of participants in division';
      return false;
    }
    return true;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateRunOverallRank(value: string) {
    if (!this._validateRunOverallRank(value)) {
      return;
    }
    this.update('runOverallRank', this.details.uiRaceDetails.runOverallRank, '');
  }

  private _validateRunOverallRank(value: string) {
    this.runOverallRankError = null;
    if (!value) {
      return true;
    }
    if (this.details.uiRaceDetails.totalParticipants && parseInt(value) > this.details.uiRaceDetails.totalParticipants) {
      this.runOverallRankError = 'Run overall rank cannot be more then no of participants';
      return false;
    }
    return true;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateRunGenderRank(value: string) {
    if (!this._validateRunGenderRank(value)) {
      return;
    }
    this.update('runGenderRank', this.details.uiRaceDetails.runGenderRank, '');
  }

  private _validateRunGenderRank(value: string) {
    this.runGenderRankError = null;
    if (!value) {
      return true;
    }
    if (this.details.uiRaceDetails.totalParticipantsInGender && parseInt(value) > this.details.uiRaceDetails.totalParticipantsInGender) {
      this.runGenderRankError = 'Run gender rank cannot be more then no of participants';
      return false;
    }
    return true;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateRunDivisionRank(value: string) {
    if (!this._validateRunDivisionRank(value)) {
      return;
    }
    this.update('runDivisionRank', this.details.uiRaceDetails.runDivisionRank, '');
  }

  private _validateRunDivisionRank(value: string) {
    this.runDivisionRankError = null;
    if (!value) {
      return true;
    }
    if (this.details.uiRaceDetails.totalInDivision && parseInt(value) > this.details.uiRaceDetails.totalInDivision) {
      this.runDivisionRankError = 'Run division rank cannot be more then no of participants in division';
      return false;
    }
    return true;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateCalories(nutritionField: string, value: string, min: number, max: number, errorField: string) {
    if (!this._validateCalories(errorField, value, min, max)) {
      return;
    }
    this.update(nutritionField, this.nutrition[nutritionField], 'nutrition');
  }

  private _validateCalories(errorField: string, value: string, min: number, max: number) {
    this[errorField] = null;
    if (!value) {
      return true;
    }
    if (parseInt(value) < min || parseInt(value) > max) {
      this[errorField] = `Calories should be between ${min} and ${max}`;
      return false;
    }
    return true;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateFluids(nutritionField: string, value: string, errorField: string, id: number) {
    if (!this._validateFluids(errorField, value, this.fluid.ranges[id].from, this.fluid.ranges[id].to)) {
      return;
    }
    this.update(nutritionField, this.nutrition[nutritionField], 'nutrition');
  }

  private _validateFluids(errorField: string, value: string, min: number, max: number) {
    this[errorField] = null;
    if (!value) {
      return true;
    }
    if (parseInt(value) < min || parseInt(value) > max) {
      this[errorField] = `Fluids should be between ${min} and ${max}`;
      return false;
    }
    return true;
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateSodium(nutritionField: string, value: string, min: number, max: number, errorField: string) {
    if (!this._validateSodium(errorField, value, min, max)) {
      return;
    }
    this.update(nutritionField, this.nutrition[nutritionField], 'nutrition');
  }

  private _validateSodium(errorField: string, value: string, min: number, max: number) {
    this[errorField] = null;
    if (!value) {
      return true;
    }
    if (parseInt(value) < min || parseInt(value) > max) {
      this[errorField] = `Sodium should be between ${min} and ${max}`;
      return false;
    }
    return true;
  }
  update(key: string, value, type: string) {
    value=this.textEncodeDecode.getEncodedText(value);
    const data = {
      [key]: value,
      raceId: this.race.raceId,
      athleteId: this.race.athleteId,
    } as any;

    if (type === 'nutrition') {
      data.nutritionId = this.nutrition.id;
      data.updateNutrition = "true";
    }

    this.updateRaceX.next(data);
  }

  showComments(type) {
    this.comments[type] = !this.comments[type];
    this.displayNutrition = '';
  }

  showNutrition(type) {
    if (this.displayNutrition == type) {
      this.displayNutrition = '';
    } else {
      this.displayNutrition = type;
      this.comments[type] = false;
    }
  }

  async ngOnInit() {
    if (this.race && this.details) {
      const plans = await this.seasonPlannerService.getPlans();
      this.fluid = fluid.find(f => (f.type === this.details.athleteProfile.measurementSystem));
      this.currentPlan = plans.find(plan => plan.isThisPrimarySeason === 'true');
    }
  }

  ngOnChanges(changes: SimpleChanges) {

    (changes.race && changes.race.currentValue) ? this.race = changes.race.currentValue : '';
    (changes.details && changes.details.currentValue) ? this.details = changes.details.currentValue : '';
    (changes.nutrition && changes.nutrition.currentValue) ? this.nutrition = changes.nutrition.currentValue : '';
    
    if (this.race && changes.race) {
      Object.keys(this.comments).forEach(key => this.comments[key] = this.race.daysTillRace);
    }

    if (this.details && this.details.uiRaceDetails && this.details.uiRaceDetails.actualSBTransitionTime) {
      this.isActualSBTransitionTimeRequired = true;
    }
    if (this.details && this.details.uiRaceDetails && this.details.uiRaceDetails.actualBRTransitionTime) {
      this.isActualBRTransitionTimeRequired = true;
    }

    if (changes.details
      && changes.details.currentValue 
      && changes.details.previousValue 
      && changes.details.currentValue.raceId !== changes.details.previousValue.raceId) {
      // switching to another race should reset mouse hover states
      this.distanceHoveredElement = null;
      this.distanceUnitHoveredElement = null;
      this.elevationHoveredElement = null;
    }
    
    if (this.nutrition) {
      this.nutrition.commentsPlanned = this.textEncodeDecode.getDecodedText(this.nutrition.commentsPlanned);
      this.nutrition.commentsPlannedBike = this.textEncodeDecode.getDecodedText(this.nutrition.commentsPlannedBike);
      this.nutrition.commentsPlannedRun = this.textEncodeDecode.getDecodedText(this.nutrition.commentsPlannedRun);
      this.nutrition.nutritionNotesPlanned = this.textEncodeDecode.getDecodedText(this.nutrition.nutritionNotesPlanned);
      this.nutrition.nutritionNotesActual = this.textEncodeDecode.getDecodedText(this.nutrition.nutritionNotesActual);
      this.nutrition.nutritionNotesPlannedBike = this.textEncodeDecode.getDecodedText(this.nutrition.nutritionNotesPlannedBike);
      this.nutrition.nutritionNotesActualBike = this.textEncodeDecode.getDecodedText(this.nutrition.nutritionNotesActualBike);
      this.nutrition.nutritionNotesPlannedRun = this.textEncodeDecode.getDecodedText(this.nutrition.nutritionNotesPlannedRun);
      this.nutrition.nutritionNotesActualRun = this.textEncodeDecode.getDecodedText(this.nutrition.nutritionNotesActualRun);
    }
  }

  getRatePerHour(
    proteinType: 'calories'|'fluids'|'sodium', 
    sessionType: 'bike'|'run', 
    formatType: 'planned'|'actual',
  ) {
    if (!this.details || !this.nutrition) {
      return;
    }
    var returnValue;
    var splitDataMins;
    var dataToUse;
    if (sessionType === 'bike') {

      if (formatType === 'planned') {
        if (this.details.bikePlanned.split == '' || this.details.bikePlanned.split == null) {
          return 0;
        }

        if (proteinType === 'calories') {
          dataToUse = this.nutrition.caloriesPlannedBike;
          if (dataToUse > 0) {
            splitDataMins = this._getMinutes(this.details.bikePlanned.split);
            if (splitDataMins > 0) {
              returnValue = (dataToUse * 60) / splitDataMins;
            } else {
              returnValue = 0;
            }
          } else {
            returnValue = 0;
          }
        } else if (proteinType === 'fluids') {
          dataToUse = this.nutrition.fluidsPlannedBike;
          if (dataToUse > 0) {
            splitDataMins = this._getMinutes(this.details.bikePlanned.split);
            if (splitDataMins > 0) {
              returnValue = (dataToUse * 60) / splitDataMins;
            } else {
              returnValue = 0;
            }
          } else {
            returnValue = 0;
          }
        } else if (proteinType === 'sodium') {
          dataToUse = this.nutrition.sodiumPlannedBike;
          if (dataToUse > 0) {
            splitDataMins = this._getMinutes(this.details.bikePlanned.split);
            if (splitDataMins > 0) {
              returnValue = (dataToUse * 60) / splitDataMins;
            } else {
              returnValue = 0;
            }
          } else {
            returnValue = 0;
          }
        }
      } else if (formatType === 'actual') {
        if (this.details.uiRaceDetails.actualBike == '' ||
          this.details.uiRaceDetails.actualBike == null) {
          return 0;
        }
        if (proteinType === 'calories') {
          dataToUse = this.nutrition.caloriesActualBike;
          if (dataToUse > 0) {
            splitDataMins = this._getMinutes(this.details.uiRaceDetails.actualBike);
            if (splitDataMins > 0) {
              returnValue = (dataToUse * 60) / splitDataMins;
            } else {
              returnValue = 0;
            }
          } else {
            returnValue = 0;
          }
        } else if (proteinType === 'fluids') {
          dataToUse = this.nutrition.fluidsActualBike;
          if (dataToUse > 0) {
            splitDataMins = this._getMinutes(this.details.uiRaceDetails.actualBike);
            if (splitDataMins > 0) {
              returnValue = (dataToUse * 60) / splitDataMins;
            } else {
              returnValue = 0;
            }
          } else {
            returnValue = 0;
          }
        } else if (proteinType === 'sodium') {
          dataToUse = this.nutrition.sodiumActualBike;
          if (dataToUse > 0) {
            splitDataMins = this._getMinutes(this.details.uiRaceDetails.actualBike);
            if (splitDataMins > 0) {
              returnValue = (dataToUse * 60) / splitDataMins;
            } else {
              returnValue = 0;
            }
          } else {
            returnValue = 0;
          }
        }
      }
    } else if (sessionType === 'run') {
      if (formatType === 'planned') {
        if (this.details.runPlanned.split == '' || this.details
          .runPlanned.split == null) {
          return 0;
        }

        if (proteinType === 'calories') {
          dataToUse = this.nutrition.caloriesPlannedRun;
          if (dataToUse > 0) {
            splitDataMins = this._getMinutes(this.details.runPlanned.split);
            if (splitDataMins > 0) {
              returnValue = (dataToUse * 60) / splitDataMins;
            } else {
              returnValue = 0;
            }
          } else {
            returnValue = 0;
          }
        } else if (proteinType === 'fluids') {
          dataToUse = this.nutrition.fluidsPlannedRun;
          if (dataToUse > 0) {
            splitDataMins = this._getMinutes(this.details.runPlanned.split);
            if (splitDataMins > 0) {
              returnValue = (dataToUse * 60) / splitDataMins;
            } else {
              returnValue = 0;
            }
          } else {
            returnValue = 0;
          }
        } else if (proteinType === 'sodium') {
          dataToUse = this.nutrition.sodiumPlannedRun;
          if (dataToUse > 0) {
            splitDataMins = this._getMinutes(this.details.runPlanned.split);
            if (splitDataMins > 0) {
              returnValue = (dataToUse * 60) / splitDataMins;
            } else {
              returnValue = 0;
            }
          } else {
            returnValue = 0;
          }
        }
      } else if (formatType === 'actual') {
        if (this.details.uiRaceDetails.actualRun == '' ||
          this.details.uiRaceDetails.actualRun == null) {
          return 0;
        }
        if (proteinType === 'calories') {
          dataToUse = this.nutrition.caloriesActualRun;
          if (dataToUse > 0) {
            splitDataMins = this._getMinutes(this.details.uiRaceDetails.actualRun);
            if (splitDataMins > 0) {
              returnValue = (dataToUse * 60) / splitDataMins;
            } else {
              returnValue = 0;
            }
          } else {
            returnValue = 0;
          }
        } else if (proteinType === 'fluids') {
          dataToUse = this.nutrition.fluidsActualRun;
          if (dataToUse > 0) {
            splitDataMins = this._getMinutes(this.details.uiRaceDetails.actualRun);
            if (splitDataMins > 0) {
              returnValue = (dataToUse * 60) / splitDataMins;
            } else {
              returnValue = 0;
            }
          } else {
            returnValue = 0;
          }
        } else if (proteinType === 'sodium') {
          dataToUse = this.nutrition.sodiumActualRun;
          if (dataToUse > 0) {
            splitDataMins = this._getMinutes(this.details.uiRaceDetails.actualRun);
            if (splitDataMins > 0) {
              returnValue = (dataToUse * 60) / splitDataMins;
            } else {
              returnValue = 0;
            }
          } else {
            returnValue = 0;
          }
        }
      }
    }
    return Math.round(returnValue*100)/100;
  }

  switchBikeSite() {
    if (this.isSiteSwitchAllowed()) {
      this.bikeSiteSwitched = !this.bikeSiteSwitched;
    }
  }

  isSiteSwitchAllowed() {
    return moment().isBefore(moment(this.details.uiRaceDetails.raceDate).subtract(7, 'days')) || this.bikeSiteSwitched;
  }

  toggleDistanceInput(el: DistanceElement = null) {
    this.distanceUnitHoveredElement = el;
    if (this.isPastOrListedRace()) {
      return; // Don't allow to edit distance for past races and non-custom races
    }
    this.distanceHoveredElement = el;
  }
  
  toggleElevationInput(el: ElevationElement = null) {
    if (this.isPastOrListedRace()) {
      return; // Don't allow to edit distance for past races and non-custom races
    }
    this.elevationHoveredElement = el;
  }

  distanceEditMode(el: DistanceElement) {
    if (isMobileSafari()) {
      return true;
    }
    return this.distanceHoveredElement === el;
  }
  
  distanceUnitEditMode(el: DistanceElement) {
    if (isMobileSafari()) {
      return true;
    }
    return this.distanceUnitHoveredElement === el;
  }
  
  elevationEditMode(el: ElevationElement) {
    if (isMobileSafari()) {
      return true;
    }
    return this.elevationHoveredElement === el;
  }

  toggleUnits(el: DistanceElement) {
    const altUnit = this.getAltUnit(el);
    this.details.uiRaceDetails[`alternate${el}Units`] = this.getUnit(el);
    this.details.uiRaceDetails[`${el}Units`] = altUnit;
  }

  getMeasurementSystem() {
    return this.details.athleteProfile.measurementSystem === 'standard' ? ['yds', 'mi'] : ['m', 'km'];
  }

  getUnit(el: DistanceElement) {
    return this.details.uiRaceDetails[`${el}Units`];
  }

  getAltUnit(el: DistanceElement) {
    return this.details.uiRaceDetails[`alternate${el}Units`];
  }

  getDistance(el: DistanceElement): number {
    return parseFloat(this.details.uiRaceDetails[`${el}DistanceInUnits`]);
  }
  
  getElevation(el: DistanceElement): number {
    return parseFloat(this.details[`${el}Planned`].elevationChange);
  }
  
  getElevationUnit(): string {
    return this.details.athleteProfile.measurementSystem === 'standard' ? 'ft' : 'm';
  }

  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateDistance(el: DistanceElement, value: string, applyValidation = true) {
    this.distanceErrors = {};
    if (!value) {
      return;
    }
    const units = this.getUnit(el);
    if (applyValidation) {
      const parsed = parseFloat(value);
      const range = DISTANCE_VALIDATION_RANGES[el][units];
      if (parsed < range[0] || parsed > range[1]) {
        this.distanceErrors[el] = `Must be in range ${range[0]}${units}-${range[1]}${units}`;
        return;
      }
    }
    this.details.uiRaceDetails[`${el}DistanceInUnits`] = value;
    const data = {
      [el + 'DistanceInUnits']: value,
      [el + 'Units']: units,
      raceId: this.race.raceId,
      athleteId: this.race.athleteId,
    };
    console.log('update', data)
    this.updateRaceX.next(data);
  }
  
  @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
  updateElevation(el: ElevationElement, value: string) {
    this.elevationErrors = {};
    if (!value) {
      return;
    }
    const units = this.getElevationUnit();
    const parsed = parseFloat(value);
    const range = ELEVATION_VALIDATION_RANGES[units];
    if (parsed < range[0] || parsed > range[1]) {
      this.elevationErrors[el] = `Must be in range ${range[0]}${units}-${range[1]}${units}`;
      return;
    }
    this.details[`${el}Planned`].elevationChange = value;
    const data = {
      [el + 'Elevation']: value,
      raceId: this.race.raceId,
      athleteId: this.race.athleteId,
    };
    this.updateRaceX.next(data);
  }

  onPan(e) {
    this.browserScrollService.onPan(e);
  }

  onPanEnd(e) {
    this.browserScrollService.onPanEnd(e);
  }

  private _getMinutes(input: string) {
    const parts = input.split(':');
    if (parts.length === 3) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    if (parts.length === 2) {
      return parseInt(parts[0]);
    }
  }
  
  private isPastOrListedRace(): boolean {
    if (this.race && this.race.daysTillRace == 0) {
      return true;
    }
    if (this.details && !this.details.raceEventDetails.custom) {
      return true;
    }
    return false;
  }
}
