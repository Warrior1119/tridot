import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SeasonPlannerService } from '../../season-planner.service';
import { RACE_DISTANCES } from './../../../constants/race-distances.constants';
import { LocalstorageService } from './../../../common-services/localstorage.service';

@Component({
  selector: 'app-phase-preferences',
  templateUrl: './phase-preferences.component.html',
  styleUrls: ['./phase-preferences.component.scss']
})
export class PhasePreferencesComponent implements OnInit {


  @Input() displayModal;
  @Output() preferences = new EventEmitter();
  @Input() phaseId;
  @Input() raceId;
  @Input() raceDistanceId: number;
  data = {
    b2rFactor: false,
    bikeLongSessionDay: '',
    bikeVolumnPreferece: '',
    dayOff: '',
    phaseId: null,
    phaseTrainingPreferences: '',
    raceId: null,
    runLongSessionDay: '',
    runVolumePreference: '',
    seasonPlanId: null,
    swimVolumePreference: '',
    trainingDaysPerWeek: 2,
  };

  days = [
    {
      'code': 'none',
      'display': 'None',
      'definition': 'None.'
    },
    {
      'code': 'mon',
      'display': 'Monday',
      'definition': 'Monday.'
    },
    {
      'code': 'tue',
      'display': 'Tuesday',
      'definition': 'Tuesday.'
    },
    {
      'code': 'wed',
      'display': 'Wednesday',
      'definition': 'Wednesday.'
    },
    {
      'code': 'thu',
      'display': 'Thursday',
      'definition': 'Thursday.'
    },
    {
      'code': 'fri',
      'display': 'Friday',
      'definition': 'Friday.'
    },
    {
      'code': 'sat',
      'display': 'Saturday',
      'definition': 'Saturday.'
    },
    {
      'code': 'sun',
      'display': 'Sunday',
      'definition': 'Sunday.'
    }
  ];

  daysRun = [
    {
      'code': 'wed',
      'display': 'Wednesday',
      'definition': 'Wednesday.'
    },
    {
      'code': 'sat',
      'display': 'Saturday',
      'definition': 'Saturday.'
    },
    {
      'code': 'sun',
      'display': 'Sunday',
      'definition': 'Sunday.'
    }
  ];

  daysBike = [
    {
      'code': 'sat',
      'display': 'Saturday',
      'definition': 'Saturday.'
    },
    {
      'code': 'sun',
      'display': 'Sunday',
      'definition': 'Sunday.'
    }
  ];

  checks = {
    swimBikeRun: true,
    bikeRun: false,
    run: false
  };

  volumePreferences = [
    { name: 'Standard Volume', value: 'standard' },
    { name: 'High Volume', value: 'high' },
    { name: 'Low Volume', value: 'low' }
  ];

  constructor(private seasonPlannerService: SeasonPlannerService,
              private localstorageService: LocalstorageService) { }

  closeModal() {
    this.displayModal.hide();
  }

  changePref(code) {
    this.data.phaseTrainingPreferences = code;
    if (this.data.phaseTrainingPreferences === 'sbr') {
      this.data.swimVolumePreference = this.data.swimVolumePreference || 'standard';
      this.data.bikeVolumnPreferece = this.data.bikeVolumnPreferece || 'standard';
      this.data.runVolumePreference = this.data.runVolumePreference || 'standard';
    } else if (this.data.phaseTrainingPreferences === 'br') {
      this.data.bikeVolumnPreferece = this.data.bikeVolumnPreferece || 'standard';
      this.data.runVolumePreference = this.data.runVolumePreference || 'standard';
    } else if (this.data.phaseTrainingPreferences === 'r') {
      this.data.runVolumePreference = this.data.runVolumePreference || 'standard';
    }
  }

  validate() {
    if (this.data.bikeLongSessionDay === this.data.dayOff) {
      return 'Bike Long Session & Off Day cannot be on the same day';
    } else if (this.data.bikeLongSessionDay === this.data.runLongSessionDay) {
      return 'Bike Long Session & Run Long Session cannot be on the same day';
    } else if (this.data.dayOff === this.data.runLongSessionDay) {
      return 'Run Long Session & Off Day cannot be on the same day';
    }
  }

  async getPreferences(phaseId, raceId) {
    const {body} = await this.seasonPlannerService.getPhasePreferences(phaseId, raceId).toPromise();
    this.data = body.response;
  }

  async save(data) {
    try {
      data.athleteId = this.localstorageService.getMemberId();
      data.raceId = this.raceId;
      data.phaseId = this.phaseId;

      data = Object.assign({}, data);
      if (data.phaseTrainingPreferences === 'br') {
        data.swimVolumePreference = '';
      } else if (data.phaseTrainingPreferences === 'r') {
        data.swimVolumePreference = '';
        data.bikeVolumnPreferece = '';
      }

      const res = await this.seasonPlannerService.savePhasePreferences(data).toPromise();
      if (res.header.status === 'success') {
          this.closeModal();
      }
    } catch (err) {
      console.error(err);
    }
  }

  ngOnInit() {
    this.getPreferences(this.phaseId, this.raceId);
    if (this.isOnlySwimBikeRunAllowed()) {
      this.data.phaseTrainingPreferences = 'sbr';
    }
  }

  public isOnlySwimBikeRunAllowed(): boolean {
    return this.raceDistanceId === RACE_DISTANCES.FULL_IRON ||
      this.raceDistanceId === RACE_DISTANCES.HALF_IRON ||
      this.raceDistanceId === RACE_DISTANCES.OLYMPIC;
  }

}
