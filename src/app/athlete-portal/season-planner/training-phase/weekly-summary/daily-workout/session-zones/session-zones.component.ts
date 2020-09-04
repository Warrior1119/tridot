import { Component, Input, Output, EventEmitter, ViewEncapsulation, OnChanges } from '@angular/core';
import * as moment from 'moment';
import {SeasonZoneSharedDataService} from './session-zones-shared.service';
import { BrowserScrollService } from '../../../../../../utils/browser-scroll-service';

@Component({
  selector: 'app-session-zones',
  templateUrl: './session-zones.component.html',
  styleUrls: ['./session-zones.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SessionZonesComponent implements OnChanges {
  
  @Input() day: any;
  @Input() session: any;
  @Input() selectedParam: string;
  @Input() overlay: boolean;
  @Output() action = new EventEmitter();
  @Output() updateNotes = new EventEmitter();
  
  zone_colors = ['#2218af', '#3e39d9', '#6a44da', '#673498', '#9b50cf', '#d486ec'];
  constructor(
    private sessionSelectedParam: SeasonZoneSharedDataService,
    private browserScrollService: BrowserScrollService,
  ) {}

  ngOnChanges() {
    if (this.overlay) {
      this.session = this.session || this.emptySessionWithEmptyZones();
    }
  }
  
  sessionAction(action) {
    this.action.next(action);
  }

  canComplete(session) {
    return !moment(session.date).isAfter(moment());
  }

  updateNotesCall(data) {
    this.updateNotes.emit(data);
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

  shouldZoneValuesBeDisplayed(zone) {
    return !!(this.session.actualTotal && +this.getActualZone(zone));
  }

  getActualZone(zone){
    var actual=zone.actual;
    if (this.selectedParam == 'heartrate') {
      actual = parseInt(zone.actualHr);
    } else if (this.selectedParam == 'power') {
      actual = parseInt(zone.actualPower);
    } else if (this.selectedParam == 'pace') {
      actual = parseInt(zone.actual);
    }
    return actual;
  }

  getZoneWidth(zone) {
    var planned = 0;
    if (this.session.actualTotal) {
      planned = parseInt(this.session.actualTotal);
    }
    var actual = zone.actual;
   actual= this.getActualZone(zone);
   
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
      var actual = zone.actual;
      actual= this.getActualZone(zone);

   
    
      if (zone.planned && actual && zone.planned !== '0' && actual !== '0') {
        return this.background((parseInt(actual) / parseInt(zone.planned)) * 100, zone.zoneType);
      } else if (parseInt(actual) > parseInt(zone.planned)) {
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

  getRangeStart(range: string) {
    const match = range.split(/\s+\-\s+/);
    return match && match[0];
  }

  getRangeEnd(range: string) {
    const match = range.split(/\s+\-\s+/);
    return match && match[1];
  }

  background(num, type) {
    const colorIndex = parseInt(type.split('')[1]) - 1;
    return 'linear-gradient(90deg,' + this.zone_colors[colorIndex] + ' ' + num + '%, transparent ' + num + '%)';
  }

  convertToHHMM(seconds, ignoreShort?: boolean) {
    if (!ignoreShort && seconds != 0 && +seconds < 30) {
      return '< 30s';
    }
    const time = moment.utc(moment.duration(+seconds, 'second').asMilliseconds());
    if (time.seconds() > 30) {
      time.add(30, 'seconds');
    }
    return time.format('HH:mm');
  }

  setParam(param) {
    this.selectedParam = param;
    this.sessionSelectedParam.setSelectedParam(param);
  }

  onPan(e) {
    this.browserScrollService.onPan(e);
  }

  onPanEnd(e) {
    this.browserScrollService.onPanEnd(e);
  }

  private emptySessionWithEmptyZones(): any {
    return {
      sessionType: 'swim',
      sessionName: 'SWIM',
      zones: [
        {zoneType: "z1"},
        {zoneType: "z2"},
        {zoneType: "z3"},
        {zoneType: "z4"},
        {zoneType: "z5"},
        {zoneType: "z6"}
      ]
    };
  }
  
}