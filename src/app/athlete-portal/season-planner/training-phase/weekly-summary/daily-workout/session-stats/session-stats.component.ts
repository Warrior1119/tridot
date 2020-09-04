import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { KM_TO_MI_MULT, M_TO_YD_MULT, M_TO_FT_MULT } from '../../../../../constants/constants';
import { BrowserScrollService } from '../../../../../../utils/browser-scroll-service';
import { ConversionUtils } from '../../../../../common-util/conversion-utils';


@Component({
  selector: 'app-session-stats',
  templateUrl: './session-stats.component.html',
  styleUrls: ['./session-stats.component.scss']
})
export class SessionStatsComponent {
  @Input() session: any;
  @Input() measurementSystem: string;
  @Input() selectedDataFile: number;
  @Output() selectLinkedFile = new EventEmitter();

  mode: string = 'stats';

  constructor(
    private browserScrollService: BrowserScrollService,
  ) {}

  private _getLegacyStats(statName: string) {
    if (!this.session.fallbackStats) {
      return false;
    }
    const data = this.session.fallbackStats;
    switch (statName) {
      case 'distance': {
        let dist = +data.distance;
        if (this.session.sessionType === 'swim') {
          return (this.poolUnits === 'yds' ? dist * M_TO_YD_MULT : dist).toFixed(0);
        }
        dist = dist / 1000;
        return (this.measurementSystem === 'standard' ? dist * KM_TO_MI_MULT : dist).toFixed(1);
      }
      case 'pool-length': {
        return data.poolLength;
      }
      case 'pool-units': {
        return data.poolLengthUnits;
      }
      case 'time': {
        return this._formatTime(+data.time);
      }
      case 'elapsed-time': {
        return this._formatTime(+data.elapsedTime);
      }
      case 'moving-time': {
        return this._formatTime(+data.movingTime);
      }
      case 'avg-speed': {
        const speedKph = data.avgSpeed * 3.6;
        return +(this.measurementSystem === 'standard' ? speedKph * KM_TO_MI_MULT : speedKph).toFixed(1);
      }
      case 'max-speed': {
        const speedKph = data.maxSpeed * 3.6;
        return +(this.measurementSystem === 'standard' ? speedKph * KM_TO_MI_MULT : speedKph).toFixed(1);
      }
      case 'moving-speed': {
        const speedKph = data.avgMovingSpeed * 3.6;
        return +(this.measurementSystem === 'standard' ? speedKph * KM_TO_MI_MULT : speedKph).toFixed(1);
      }
      case 'avg-pace': {
        return ConversionUtils.getPace(data.avgPace, this.measurementSystem, this.session.sessionType, this.poolUnits);
      }
      case 'avg-moving-pace': {
        return ConversionUtils.getPace(data.avgMovingPace, this.measurementSystem, this.session.sessionType, this.poolUnits);
      }
      case 'best-pace': {
        return ConversionUtils.getPace(data.bestPace, this.measurementSystem, this.session.sessionType, this.poolUnits);
      }
      case 'avg-heartrate': {
        return +data.avgHeartRate;
      }
      case 'max-heartrate': {
        return data.maxhr;
      }
      case 'avg-stroke-rate': {
        return +data.avgStrokeRate;
      }
      case 'max-stroke-rate': {
        return +data.maxStrokeRate;
      }
      case 'avg-strokes': {
        return +data.avgStrokes;
      }
      case 'avg-power': {
        return Math.round(+data.avgWatts);
      }
      case 'max-avg-power': {
        return Math.round(+data.avgMaxWatts);
      }
      case 'max-power': {
        return Math.round(data.maxpower);
      }
      case 'avg-cadence': {
        return data.avgcadence;
      }
      case 'max-cadence': {
        return data.maxcadence;
      }
      case 'elev-gain': {
        return (this.measurementSystem === 'standard' ? +data.totalElevationGainInFeet : data.totalElevationGain).toFixed(0);
      }
      case 'elev-loss': {
        return (this.measurementSystem === 'standard' ? +data.totalElevationLossInFeet : data.totalElevationLoss).toFixed(0);
      }
      case 'max-elev': {
        const elev = data.maxelev;
        return (this.measurementSystem === 'standard' ? elev * M_TO_FT_MULT: elev).toFixed(0);
      }
      case 'min-elev': {
        const elev = data.minelev;
        return (this.measurementSystem === 'standard' ? elev * M_TO_FT_MULT : elev).toFixed(0);
      }
      case 'calories': {
        return data.calories;
      }
      case 'min-temp': {
        return this._formatTemp(data.minTemperature);
      }
      case 'max-temp': {
        return this._formatTemp(data.maxTemperature);
      }
      case 'avg-temp': {
        return this._formatTemp(data.avgTemperature)
      }
      default: return false;
    }
  }

  getStats(statName: string) {
    if (!this.session.activityStats) {
      return this._getLegacyStats(statName);
    }
    const data = this.session.activityStats;
    switch (statName) {
      case 'distance': {
        return +data.distance.toFixed(1);
      }
      case 'pool-length': {
        return data.poolLength;
      }
      case 'pool-units': {
        return data.poolLengthUnits;
      }
      case 'time': {
        return data.time;
      }
      case 'elapsed-time': {
        return data.elapsedTime;
      }
      case 'moving-time': {
        return data.movingTime;
      }
      case 'avg-speed': {
        return +data.avgSpeed;
      }
      case 'max-speed': {
        return +data.maxSpeed;
      }
      case 'moving-speed': {
        return +data.avgMovingSpeed;
      }
      case 'avg-pace': {
        return data.avgPace;
      }
      case 'avg-moving-pace': {
        return data.avgMovingPace;
      }
      case 'best-pace': {
        return data.bestPace;
      }
      case 'avg-heartrate': {
        return +data.avgHeartRate;
      }
      case 'max-heartrate': {
        return +data.maxhr;
      }
      case 'avg-stroke-rate': {
        return data.avgStrokeRate;
      }
      case 'max-stroke-rate': {
        return data.maxStrokeRate;
      }
      case 'avg-strokes': {
        return data.avgStrokes;
      }
      case 'avg-power': {
        return data.avgPower;
      }
      case 'max-avg-power': {
        return data.avgMaxPower;
      }
      case 'max-power': {
        return data.maxpower;
      }
      case 'avg-cadence': {
        return +data.avgcadence;
      }
      case 'max-cadence': {
        return +data.maxcadence;
      }
      case 'elev-gain': {
        return typeof data.totalElevationGain === 'number' ? data.totalElevationGain.toString() : data.totalElevationGain;
      }
      case 'elev-loss': {
        return typeof data.totalElevationLoss === 'number' ? data.totalElevationLoss.toString() : data.totalElevationLoss;
      }
      case 'max-elev': {
        return data.maxelev;
      }
      case 'min-elev': {
        return data.minelev;
      }
      case 'calories': {
        return data.calories;
      }
      case 'min-temp': {
        return data.minTemperature;
      }
      case 'max-temp': {
        return data.maxTemperature;
      }
      case 'avg-temp': {
        return data.avgTemperature;
      }
      default: return false;
    }
  }

  get poolUnits() {
    const unit = this.getStats('pool-units');
    if (unit) {
      return unit === 'yards' ? 'yds' : 'm';
    }
    return this.measurementSystem === 'standard' ? 'yds' : 'm';
  }

  getSplits(split: any, statName: string) {
    switch (statName) {
      case 'distance': {
        let dist = +split.distanceMeters;
        if (this.session.sessionType === 'swim') {
          return (this.poolUnits === 'yds' ? dist * M_TO_YD_MULT : dist).toFixed(0);
        }
        dist = dist / 1000;
        return (this.measurementSystem === 'standard' ? dist * KM_TO_MI_MULT : dist).toFixed(1);
      }
      case 'time': {
        return this._formatTime(split.time);
      }
      case 'moving-time': {
        return this._formatTime(+split.movingTime);
      }
      case 'avg-speed': {
        const speedKph = split.avgSpeed * 3.6;
        return +(this.measurementSystem === 'standard' ? speedKph * KM_TO_MI_MULT : speedKph).toFixed(1);
      }
      case 'max-speed': {
        const speedKph = split.maximumSpeed * 3.6;
        return +(this.measurementSystem === 'standard' ? speedKph * KM_TO_MI_MULT : speedKph).toFixed(1);
      }
      case 'avg-moving-speed': {
        const speedKph = split.avgMovingSpeed * 3.6;
        return +(this.measurementSystem === 'standard' ? speedKph * KM_TO_MI_MULT : speedKph).toFixed(1);
      }
      case 'avg-pace': {
        return ConversionUtils.getPace(split.avgPace, this.measurementSystem, this.session.sessionType, this.poolUnits);
      }
      case 'avg-moving-pace': {
        return ConversionUtils.getPace(split.avgMovingPace, this.measurementSystem, this.session.sessionType, this.poolUnits);
      }
      case 'best-pace': {
        return ConversionUtils.getPace(split.bestPace, this.measurementSystem, this.session.sessionType, this.poolUnits);
      }
      case 'avg-heartrate': {
        return +split.averageHeartRateBpm;
      }
      case 'max-heartrate': {
        return +split.maxHeartRateBpm;
      }
      case 'avg-power': {
        return +split.avgWatts;
      }
      case 'max-avg-power': {
        return +split.avgMaxWatts;
      }
      case 'max-power': {
        return split.maxpower;
      }
      case 'avg-cadence': {
        return split.avgCadence;
      }
      case 'max-cadence': {
        return split.maxCadence;
      }
      case 'elev-gain': {
        return (this.measurementSystem === 'standard' ? split.totalElevationGainInFeet : split.totalElevationGain).toFixed(0);
      }
      case 'elev-loss': {
        return (this.measurementSystem === 'standard' ? split.totalElevationLossInFeet : split.totalElevationLoss).toFixed(0);
      }
      case 'max-elev': {
        const elev = split.maxelev;
        return (this.measurementSystem === 'standard' ? elev * M_TO_FT_MULT : elev);
      }
      case 'min-elev': {
        const elev = split.minelev;
        return (this.measurementSystem === 'standard' ? elev * M_TO_FT_MULT : elev);
      }
      case 'calories': {
        return +split.calories;
      }
      case 'avg-temp': {
        return this._formatTemp(split.averageTemperature);
      }
      case 'swim-stroke': {
        return split.swimStroke;
      }
      case 'lengths': {
        return split.length;
      }
      case 'avg-swolf': {
        return Math.round(+split.avgSwolf);
      }
      case 'total-strokes': {
        return split.totalStrokes;
      }
      case 'avg-strokes': {
        return split.avgStrokes;
      }
      case 'per-stroke': {
        return split.avgDistancePerStroke ? +split.avgDistancePerStroke.toFixed(1) : 0;
      }
      default: return false;
    }
  }

  getCumulativeTime(i: number) {
    const total = this.session.activitySplits.slice(0, i + 1).reduce((total, { time }) => total + time, 0);
    return this._formatTime(total);
  }

  onPan(e) {
    this.browserScrollService.onPan(e);
  }

  onPanEnd(e) {
    this.browserScrollService.onPanEnd(e);
  }

  private _formatTime(time: number) {
    return (time && isFinite(time)) ? moment.utc(moment.duration(time, 'seconds').asMilliseconds()).format('HH:mm:ss') : 0;
  }

  private _formatTemp(temp: number | string) {
    return this.measurementSystem === 'standard' ? Math.round(+temp) : Math.round(this._toCelsius(+temp));
  }

  private _toCelsius(tempF: number) {
    return (tempF - 32) / 1.8;
  }
}
