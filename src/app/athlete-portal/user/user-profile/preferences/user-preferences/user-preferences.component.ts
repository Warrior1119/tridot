import { Component, OnInit, Input } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal/bs-modal-ref.service";

import { CommonUtils } from "../../../../common-util/common-utils";
import { PLACEHOLDER_DD_MM_YYYY, PLACEHOLDER_MM_DD_YYYY } from "../../../../constants/date-time.constants";
import { MemberPreferencesService } from "../member-preferences.service";
import { ConversionUtils } from "../../../../common-util/conversion-utils";

@Component({
  selector: "app-user-preferences",
  templateUrl: "./user-preferences.component.html",
  styleUrls: ["./user-preferences.component.scss"],
})
export class UserPreferencesComponent {
  @Input() isMobile;
  @Input() isMobileOrTablet;
  
  public editMode: boolean = false;
  public loading: boolean = false;
  public dobFormatIntl: boolean;
  public measurementSystem: string;

  public originalPreferences: any = {};

  public tempValue: number = 0;
  public humidityValue: number = 0;
  public elevationValue: number = 0;

  public modalRef: BsModalRef;

  public humidityRange: number[] = [0, 100];

  get dateFormat() {
    return this.dobFormatIntl ? PLACEHOLDER_DD_MM_YYYY : PLACEHOLDER_MM_DD_YYYY;
  }

  get temperatureUnit() {
    return this.measurementSystem === 'standard' ? 'F' : 'C';
  }

  get elevationUnit() {
    return this.measurementSystem === 'standard' ? 'ft' : 'm';
  }

  get tempRange() {
    if (this.measurementSystem === 'standard') {
      return [0, 120];
    }

    return [-18, 49];
  }

  get elevationRange() {
    if (this.measurementSystem === 'standard') {
      return [0, 7000];
    }

    return [0, 2100];
  }

  constructor(
    private memberPreferencesService: MemberPreferencesService,
    private modalService: BsModalService,
  ) {
    this.memberPreferencesService.getMemberPreferences().toPromise().then((x) => {
      const data = x.body.response;

      this.dobFormatIntl = data.prefDateFormat &&
        data.prefDateFormat.toUpperCase() === PLACEHOLDER_DD_MM_YYYY;

      this.measurementSystem = data.measurementSystem;

      this.tempValue = data.indoorTemperature;
      this.humidityValue = data.indoorHumidity;
      this.elevationValue = data.indoorElevation;

      if (this.measurementSystem === 'metric') {
        this.tempValue = ConversionUtils.ftoc(this.tempValue);
        this.elevationValue = ConversionUtils.feetToMeters(this.elevationValue);
      } 

      this.saveOriginalPreferences();
    });
  }

  public saveOriginalPreferences() {
    this.originalPreferences.dobFormatIntl = this.dobFormatIntl;
    this.originalPreferences.measurementSystem = this.measurementSystem;
    this.originalPreferences.tempValue = this.tempValue;
    this.originalPreferences.humidityValue = this.humidityValue;
    this.originalPreferences.elevationValue = this.elevationValue;
  }

  public cancel() {
    this.dobFormatIntl = this.originalPreferences.dobFormatIntl;
    this.measurementSystem = this.originalPreferences.measurementSystem;
    this.tempValue = this.originalPreferences.tempValue;
    this.humidityValue = this.originalPreferences.humidityValue;
    this.elevationValue = this.originalPreferences.elevationValue;

    this.editMode = false;
  }

  public updateMemberPreferences() {
    this.loading = true;

    this.saveMemberPreferences({
      measurementSystem: this.measurementSystem,
      prefDateFormat: this.dateFormat,
      // tslint:disable-next-line:object-literal-sort-keys
      indoorHumidity: this.humidityValue,
      indoorTemperature: this.tempValue,
      indoorElevation: this.elevationValue,
    });

  }

  public isSaveDisabled() {
    return this.loading || !(this.isTempValid() && this.isHumidityValid() && this.isElevationValid());
  }

  public isTempValid() {
    const [min, max] = this.tempRange;

    if (!this.tempValue && this.tempValue !== 0) {
      return false;
    }

    return this.tempValue >= min && this.tempValue <= max;
  }

  public isHumidityValid() {
    const [min, max] = this.humidityRange;

    if (!this.humidityValue && this.humidityValue !== 0) {
      return false;
    }

    return this.humidityValue >= min && this.humidityValue <= max;
  }

  public isElevationValid() {
    const [min, max] = this.elevationRange;

    if (!this.elevationValue && this.elevationValue !== 0) {
      return false;
    }

    return this.elevationValue && this.elevationValue >= min && this.elevationValue <= max;
  }

  public saveMemberPreferences(data): void {
    this.memberPreferencesService.saveMemberPreferences(data).toPromise()
      .then(() => {
          this.saveOriginalPreferences();
          this.loading = false;
          this.editMode = false;
        })
      .catch(() => {
        this.loading = false;
        CommonUtils.modalMessage("Error", "Sorry, error occured", this.modalRef, "error", this.modalService, "DISMISS");
      });
  }

  public setMeasurementUnit(metric: string) {
    this.measurementSystem = metric;
    if (metric === 'standard') {
      this.tempValue = ConversionUtils.ctof(this.tempValue);
      this.elevationValue = ConversionUtils.metersToFeet(this.elevationValue);
    } else {
      this.tempValue = ConversionUtils.ftoc(this.tempValue);
      this.elevationValue = ConversionUtils.feetToMeters(this.elevationValue);
    }
  }
}
