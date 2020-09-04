import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from "@angular/core";
import {
  _formatGeoLocation,
  getAddressComponent,
} from "../../../athlete-portal/assessments/assessment-modal/assessment-modal.component";
import { CoachPortalService } from "../../coach-portal.service";

@Component({
  selector: 'app-coach-contact-info',
  templateUrl: './coach-contact-info.component.html',
  styleUrls: ['./coach-contact-info.component.scss']
})
export class CoachContactInfoComponent implements OnInit {
  public editMode: boolean = false;
  public loading: boolean = false;
  public locationAddress: any;
  public locationSettings: any = {
    inputPlaceholderText: "Choose Location",
    showSearchButton: false,
    geoTypes: ["(regions)", "(cities)"],
    showCurrentLocation: true,
    showRecentSearch: true,
  };
  @Input() public coachProfile: any;
  @Output() public resetProfile: EventEmitter<void> = new EventEmitter<void>();
  @Output() public saveProfile: EventEmitter<void> = new EventEmitter<void>();

  get valid() {
    return this.coachProfile &&
      this.coachProfile.lastName.trim() &&
      this.coachProfile.firstName.trim() &&
      this.coachProfile.email.trim();
  }

  constructor(
    private coachService: CoachPortalService,
  ) { }

  public ngOnInit() {
    this.refreshLocationInput();
  }

  public enableEditMode() {
    this.refreshLocationInput();

    this.editMode = true;
  }

  public disableEditMode() {
    this.editMode = false;
  }

  public async onLocationChange(location) {
    if (!location || !location.data) {
      return;
    }

    this.locationAddress = {
      coords: {
        latitude: location.data.geometry.location.lat,
        longitude: location.data.geometry.location.lng,
      },
      city: getAddressComponent(location.data, "locality") || "",
      state: getAddressComponent(location.data, "administrative_area_level_1") || "",
      country: getAddressComponent(location.data, "country") || "",
      zipCode: getAddressComponent(location.data, "postal_code") || "",
      formatted_address: _formatGeoLocation(location.data),
    };
  }

  public cancel() {
    this.resetProfile.emit();
    this.disableEditMode();
  }

  public save() {
    this.loading = true;

    if (this.locationAddress) {
      this.coachProfile.city = this.locationAddress.city;
      this.coachProfile.state = this.locationAddress.state;
      this.coachProfile.zipCode = this.locationAddress.zipCode;
      this.coachProfile.countryCode = this.locationAddress.country;
    }

    this.coachService.saveCoachProfile(this.coachProfile).toPromise().then(() => {
      this.saveProfile.emit();
      this.loading = false;
      this.disableEditMode();
    }).catch((error) => {
      this.loading = false;
      console.log(error);
    });
  }

  private refreshLocationInput() {
    if (this.coachProfile) {
      this.locationSettings = {
        ...this.locationSettings,
        inputString: `${this.coachProfile.city}, ${this.coachProfile.state || this.coachProfile.countryCode}`,
      };
    }
  }
}
