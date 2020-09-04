import { Component, OnInit } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { TrainIntensitiesService } from './train-intensities.service';
import { TrainingIntensitesHelpComponent } from './training-intensites-help/training-intensites-help.component';
import {Router} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LocalstorageService } from './../common-services/localstorage.service';

@Component({
  selector: 'app-training-intensities',
  templateUrl: './training-intensities.component.html',
  styleUrls: ['./training-intensities.component.scss']
})
export class TrainingIntensitiesComponent implements OnInit {
  zones;
  actualsChanged = false;

  modalRef: BsModalRef;
  alerts: any[] = [];
  profile: any;

  public temperature: string | number;
  public baseTemperature: string | number;
  public humidity: string | number;
  public baseHumidity: string | number;
  public elevation: string | number;
  public baseElevation: string | number;
  public controlErrors = {};

  private tempRange: number[] = [0, 120];
  private humidityRange: number[] = [0, 100];
  private elevationRange: number[] = [0, 7000];

  private parameterValuesChanged: boolean;
  private loaderToBeVisible: boolean;

  constructor(
    private router: Router,
    private trainingIntense: TrainIntensitiesService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private localstorageService: LocalstorageService,
  ) {
    this.profile = this.localstorageService.getAthleteProfileIfExists();
    this.setMeasurementSystem(this.profile);
  }

  setMeasurementSystem(profile) {
    if (profile.measurementSystem === 'standard') {
      profile.swimUnits = 'yards';
      profile.runUnits = 'miles';

    } else if (profile.measurementSystem === 'metric') {
      profile.swimUnits = 'meters';
      profile.runUnits = 'kms';
      this.tempRange = [-18, 49];
      this.elevationRange = [0, 2100];
    }
  }

  private getTrainingIntensities(temp, humidity, elevation): void {
    // this.toastr.success('Loading...');

    this.trainingIntense.getTrainingIntensities(
      parseInt(temp, 10),
      parseInt(humidity, 10),
      parseInt(elevation, 10),
      this.profile.swimUnits,
      this.profile.runUnits
    ).subscribe((res) => {
      this.zones = res.body.response;
      this.parameterValuesChanged = false;
      this.loaderToBeVisible = false;
    }, (err) => {
      console.error(err);
    });
  }

  updateMeasurement(value, key) {
    if (key === 'runUnits') {
      this.profile.runUnits = value;
    } else if (key === 'swimUnits') {
      this.profile.swimUnits = value;
    }
    this.validateAndUpdate(false);
  }

  resetValues() {
    this.temperature = this.baseTemperature;
    this.humidity = this.baseHumidity;
    this.elevation = this.baseElevation;
    this.getTrainingIntensities(this.temperature, this.humidity, this.elevation);
    this.actualsChanged = false;
    this.controlErrors = {};
    this.parameterValuesChanged = false;
  }

  public validateAndUpdate(actualsChanged = true): void {
    if (actualsChanged) {
      this.actualsChanged = true;
    }
    this.loaderToBeVisible = true;

    const isTemperatureValid: boolean = this.isInValidNumericRange('Temperature', this.temperature, this.tempRange);
    const isHumidityValid: boolean = this.isInValidNumericRange('Humidity', this.humidity, this.humidityRange);
    const isElevationValid: boolean = this.isInValidNumericRange('Elevation', this.elevation, this.elevationRange);
    if (isTemperatureValid && isHumidityValid && isElevationValid) {
      this.getTrainingIntensities(this.temperature, this.humidity, this.elevation);
    }
  }

  private isInValidNumericRange(type: string, value: string | number, range: number[]): boolean {
    if (!this.isValidInteger(value)) {
      this.controlErrors[type] = type + ' is not valid number.';
      return false;
    }

    if (!this.between(parseInt('' + value, 10), range[0], range[1])) {
      this.controlErrors[type] = type + ' must be in between ' + range[0] + ' & ' + range[1] + '.';
      return false;
    }
    this.controlErrors[type] = undefined;

    return true;
  }

  getLengthUnit() {
    if (this.profile.measurementSystem === 'standard') {
      return ' ft';
    } else {
      return ' m';
    }
  }

  changeTab(sessionType) {
    this.router.navigate(['/training-intensities'], { queryParams: { sessionType: sessionType } });
  }


  between(x, min, max) {
    return x >= min && x <= max;
  }

  getWeather(position) {
    this.trainingIntense.getWeather('home', position).subscribe((res) => {
      const weather = res.body.response;
      if (this.profile.measurementSystem === 'standard') {
        this.temperature = weather.tempF;
        this.baseTemperature = weather.tempF;
      } else {
        this.temperature = weather.tempC;
        this.baseTemperature = weather.tempC;
      }
      this.humidity = weather.humidity;
      this.baseHumidity = weather.humidity;
      this.elevation = weather.elevationFt;
      this.baseElevation = weather.elevationFt;
      this.getTrainingIntensities(this.temperature, this.humidity, this.elevation);
    });
  }

  getIntValue(value) {
    return parseInt(value, 10);
  }

  formatTime(time) {
    if (time === null || time === undefined) {
      return '';
    }

    const str = time.replace(/^(?:00:)?0?/, '');
    return str;
  }

  openHelp() {
    this.modalRef = this.modalService.show(TrainingIntensitesHelpComponent, {
      class: 'modal-lg'
    });
    this.modalRef.content.displayModal = this.modalRef;
  }

  private isValidInteger(value: any): boolean {
    if (value instanceof String) {
      return value.match(/^-{0,1}\d+$/gm) !== null;
    } else {
      return !isNaN(value);
    }
  }

  ngOnInit() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.getWeather(position);
        },
        (err) => {
          console.log(err);
          this.getWeather(null);
        },
        {timeout:10000}
      );
    }
  }

  enableApply() {
    this.actualsChanged = true;
    this.parameterValuesChanged = true;
  }
}
