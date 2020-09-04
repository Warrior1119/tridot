import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../../../environments/environment";
import { LocalStorage } from "../../../athlete-portal/common-services/local-storage";
import { LocalstorageService } from "../../../athlete-portal/common-services/localstorage.service";
import { OnboardService } from "../../../onboard/onboard.service";

@Component({
  selector: "app-coach-athlete-preview-panel",
  templateUrl: "./coach-athlete-preview-panel.component.html",
  styleUrls: ["./../coach-athletes.component.scss", "./coach-athlete-preview-panel.component.scss"],
})
export class CoachAthletePreviewPanelComponent {
  @Input() public athleteDetails: any = {};
  @Output() public userDashboard: EventEmitter<void> = new EventEmitter<void>();

  public performanceLevels = {
    1: "Beginner",
    2: "Intermediate",
    3: "Competetive",
    4: "Highly Competetive",
    5: "Elite",
  };

  get athletePhotoThumbnail(): string {
    if (this.athleteDetails && this.athleteDetails.photoThumbnail) {
      return environment.API_ENDPOINT + this.athleteDetails.photoThumbnail;
    } else if (this.athleteDetails && this.athleteDetails.gender && (this.athleteDetails.gender.toLowerCase() === "f" || this.athleteDetails.gender.toLowerCase() === "female")) {
      return "../assets/img/female-avatar.png";
    } else {
      return "../assets/img/male-avatar.png";
    }
  }

  get assignmentStatusStyle(): string {
    if (this.athleteDetails && this.athleteDetails.assignmentStatus === "Assigned to Seat") {
      return "active";
    } else if (this.athleteDetails && this.athleteDetails.assignmentStatus === "Linked to Coach") {
      return "inactive";
    }
    return "";
  }

  constructor(private localstorageService: LocalstorageService,
              private router: Router,
              private localStorage: LocalStorage,
              private onboardService: OnboardService) {}


  public getHeight() {
    if (this.athleteDetails && this.athleteDetails.measurementSystem === "standard") {
      return this._getHeightInInches(this.athleteDetails.height);
    }
    return  this.athleteDetails && this.athleteDetails.height;
  }

  public async navigateToAtheleteDashboard(): Promise<void> {
    this.userDashboard.emit();
  }

  public getWeightPostfix() {
      return "lbs";
  }

  private _getHeightInInches(feetAndInches: string) {
    return 12 * parseInt(feetAndInches.split("'")[0], 10) + parseInt(feetAndInches.split("'")[1], 10);
  }
}
