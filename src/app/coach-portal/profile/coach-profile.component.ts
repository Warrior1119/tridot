import { Component, OnInit } from "@angular/core";
import * as moment from "moment";
import { BsModalService } from "ngx-bootstrap/modal";
import { environment } from "../../../environments/environment";
import { CommonUtils } from "../../athlete-portal/common-util/common-utils";
import { DEFAULT_PROFILE_PICTURE } from "../../athlete-portal/constants/constants";
import { CoachPortalService } from "../coach-portal.service";

@Component({
    selector: "coach-profile",
    styleUrls: ["./coach-profile.component.scss"],
    templateUrl: "coach-profile.component.html",
})
export class CoachProfileComponent implements OnInit {
  public coachProfile: any;
  public originalProfile: any;
  public loading = false;
  public avatarLoading = false;
  public editLoading = false;
  public editMode = false;

  public athleteFocuses = [
    {
      id: "beginnerFocus",
      name: "Beginners",
    },
    {
      id: "clydesdalesFocus",
      name: "Athenas/Clydesdales",
    },
    {
      id: "intermediateFocus",
        name: "Intermediate",
    },
    {
      id: "highlyCompetitiveFocus",
        name: "Highly Competitive",
    },
    {
      id: "eliteFocus",
        name: "Elite",
    },
  ];

  public formatFocuses = [
    {
      id: "sprintFocus",
      name: "Sprint",
    },
    {
      id: "olympicFocus",
      name: "Olympic",
    },
    {
      id: "halfIronFocus",
      name: "Half",
    },
    {
      id: "fullIronFocus",
      name: "Full",
    },
  ];

  public disciplineFocuses = [
    {
      id: "swimFocus",
      name: "Swim",
    },
    {
      id: "bikeFocus",
      name: "Bike",
    },
    {
      id: "runFocus",
      name: "Run",
    },
    {
      id: "nutritionFocus",
      name: "Nutrition",
    },
  ];

  public dateStartedCoaching: any;
  public dateStartedCoachingValid: boolean;

  get coachType() {
    return this.coachProfile.coachAffilationType === "al" ? "Alliance" : "Independent";
  }

  public get profilePicture() {
    return this._getCoachProfilePicture(this.coachProfile && this.coachProfile.profilePhotoLarge);
  }

  constructor(
    private coachService: CoachPortalService,
    private modalService: BsModalService,
  ) {}

  public async ngOnInit() {
    await this.getCoachProfile();
    this.dateStartedCoaching = moment(this.coachProfile.dateStartedCoaching).format("MM/DD/YYYY");
  }

  public resetProfile() {
    this.coachProfile = Object.assign({}, this.originalProfile);
  }

  public saveProfile() {
    this.originalProfile = Object.assign({}, this.coachProfile);
  }

  public getFocus(type: "athlete" | "format" | "discipline") {
    const result = this[type + "Focuses"].map(({ id, name }) => {
      if (this.coachProfile[id] === "true") {
        return name;
      }
    }).filter((x) => x);

    return result.join(", ");
  }

  public toggleFocus(id) {
    this.coachProfile[id] === "true" ? this.coachProfile[id] = "false" : this.coachProfile[id] = "true";
  }

  public enableEditMode() {
    this.editMode = true;
  }

  public save() {
    if (this.dateStartedCoachingValid) {
      this.editLoading = true;
      this.coachService.saveCoachProfile(this.coachProfile).toPromise().then(() => {
        this.saveProfile();
        this.editLoading = false;
        this.editMode = false;
      }).catch((error) => {
        this.editLoading = false;
        console.log(error);
      });
    }
  }

  public cancel() {
    this.resetProfile();
    this.editMode = false;
  }

  public dateStartedCoachingChange($event: any) {
    this.dateStartedCoachingValid = $event.length === 10 &&
      moment($event, "MM/DD/YYYY").isAfter(moment().subtract(100, "years")) &&
      moment().isAfter(moment($event, "MM/DD/YYYY"));

    if (this.dateStartedCoachingValid) {
      this.dateStartedCoaching = $event;
      this.coachProfile.dateStartedCoaching = moment($event, "MM/DD/YYYY")
        .utc()
        .add(moment($event, "MM/DD/YYYY").utcOffset(), "m")
        .toISOString();
    }
  }

  public onAvatarSelected(event: Event, fileRef: HTMLInputElement) {
    this.avatarLoading = true;
    const [ file ] = (event.target as any).files;

    this.coachService.uploadAvatar(this.coachProfile.coachId, file)
      .toPromise()
      .then(async () => {
        await this.loadProfile();
        this.avatarLoading = false;
        fileRef.value = null;
      }).catch(() => {
        this.avatarLoading = false;
        fileRef.value = null;
      });
  }

  private async getCoachProfile(): Promise<void> {
    this.loading = true;
    try {
      await this.loadProfile();
    } catch (error) {
      this.coachProfile = {};
      CommonUtils.defaultErrorModalMessage(this.modalService);
    } finally {
      this.loading = false;
    }
  }

  private async loadProfile() {
    const response = await this.coachService.getCoachProfile().toPromise();
    this.coachProfile = response.coachProfile;
    this.originalProfile = Object.assign({}, this.coachProfile);
  }

  private _getCoachProfilePicture(profilePicture: string) {
    return profilePicture ? `${environment.API_ENDPOINT}${profilePicture}` : DEFAULT_PROFILE_PICTURE;
  }
}
