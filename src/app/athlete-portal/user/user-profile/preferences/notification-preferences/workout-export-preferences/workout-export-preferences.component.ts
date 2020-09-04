import { Component, Input} from '@angular/core';
import { WorkoutExportPreferencesService } from './workout-export-preferences.service';
import { CommonUtils } from '../../../../../common-util/common-utils';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-workout-export-preferences',
  templateUrl: './workout-export-preferences.component.html',
  styleUrls: ['./workout-export-preferences.component.scss']
})
export class WorkoutExportPreferenceComponent {
  @Input() isMobileOrTablet;
  @Input() isMobile;

  public editMode: boolean = false;
  public loading = false;
  
  public workoutExportPreferences = {
    "autoPushToDevice" : false,
    "prefIntensityMetric" : "POWER",
    "prefExportFileType" : "FIT",
    "defaultPrependWUTime" : 0,
    "defaultAppendMSTime" : 0,
    "defaultWUMSInsertTime" : 0
  };

  private origWorkoutExportPreferences = {};

  constructor(private workoutExportPreferencesService: WorkoutExportPreferencesService,
              private modalService: BsModalService) { 
  }

  async ngOnInit() {
    try {
      const res = await this.workoutExportPreferencesService.getWorkoutExportPreferences().toPromise(); 
      this.origWorkoutExportPreferences = res.body.response;
      this.workoutExportPreferences = Object.assign(this.workoutExportPreferences, this.origWorkoutExportPreferences);
    } catch (err) {
      console.error('Error while fetching workout export preferences', err);
    }
  }

  cancel() {
    this.editMode = false;
    this.workoutExportPreferences = Object.assign({}, this.origWorkoutExportPreferences) as any;
  }

  async saveWorkoutExportPreferences() {
    this.loading = true;
    try {
      await this.workoutExportPreferencesService.saveWorkoutExportPreferences(this.workoutExportPreferences).toPromise(); 
      this.origWorkoutExportPreferences = Object.assign({}, this.workoutExportPreferences);
      this.editMode = false;
    } catch (error) {
      CommonUtils.defaultErrorModalMessage(this.modalService, "Unable to save workour export preferences. Please try again later.")
    } finally {
      this.loading = false;
    }
  }

  public decrementPrependTime(): void {
    if (this.workoutExportPreferences.defaultPrependWUTime <= 0) {
      return;
    }
    this.workoutExportPreferences.defaultPrependWUTime -= 1;
  }

  public incrementPrependTime(): void {
    if (this.workoutExportPreferences.defaultPrependWUTime >= 90) {
      return;
    }
    this.workoutExportPreferences.defaultPrependWUTime += 1;
  }

  public decrementAppendTime(): void {
    if (this.workoutExportPreferences.defaultAppendMSTime <= 0) {
      return;
    }
    this.workoutExportPreferences.defaultAppendMSTime -= 1;
  }

  public incrementAppendTime(): void {
    if (this.workoutExportPreferences.defaultAppendMSTime >= 90) {
      return;
    }
    this.workoutExportPreferences.defaultAppendMSTime += 1;
  }

  public decrementInsertTime(): void {
    if (this.workoutExportPreferences.defaultWUMSInsertTime <= 0) {
      return;
    }
    this.workoutExportPreferences.defaultWUMSInsertTime -= 1;
  }

  public incrementInsertTime(): void {
    if (this.workoutExportPreferences.defaultWUMSInsertTime >= 90) {
      return;
    }
    this.workoutExportPreferences.defaultWUMSInsertTime += 1;
  }

  get prefIntensityMetric(): string {
    const prefIntensityMetric = this.workoutExportPreferences.prefIntensityMetric;
    switch (prefIntensityMetric) {
      case 'VARIABLE':
        return 'Variable';
      case 'HR':
        return 'Heart Rate';
      default:
        return 'Power';
    }
  }

  get prefExportFileType(): string {
    const prefExportFileType = this.workoutExportPreferences.prefExportFileType;
    switch (prefExportFileType) {
      case 'ERG':
        return '.erg';
      case 'MRC':
        return '.mrc';
      case 'ZWO':
        return '.zwo';
      default:
        return '.fit';
    }
  }

  public onClickHRPref(): any {
    if (this.workoutExportPreferences.prefExportFileType === 'FIT') {
      this.workoutExportPreferences.prefIntensityMetric = 'HR';
      return;
    } else {
      return;
    }     
  }

  public onClickVariablePref(): any {
    if (this.workoutExportPreferences.prefExportFileType === 'FIT') {
      this.workoutExportPreferences.prefIntensityMetric = 'VARIABLE';
      return;
    } else {
      return;
    }     
  }

  public onChangeFileType(value: string): any {
    this.workoutExportPreferences.prefExportFileType = value;
    if (value !== 'FIT') {
      this.workoutExportPreferences.prefIntensityMetric = 'POWER';
    }
  }

}
