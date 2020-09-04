import { Component, OnInit } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ToastrService } from "ngx-toastr";
import { getWindowWidth } from "../../../../utils/browser";
import { ConfirmationModalComponent } from "../../../common-components/confirmation-modal/confirmation-modal.component";
import { MessageModalComponent } from "../../../common-components/message-modal/message-modal.component";
import { DEFAULT_ERROR_MESSAGE, TABLET_WIDTH_THRESHOLD } from "../../../constants/constants";
import { UserProfileService } from "../user-profile.service";
import { LocalstorageService } from "./../../../common-services/localstorage.service";
import { MyBikesLearnMoreModalComponent } from "./my-bikes-learn-more-modal/my-bikes-learn-more-modal.component";
import { CommonUtils } from '../../../common-util/common-utils';

@Component({
  selector: "app-my-bikes",
  templateUrl: "./my-bikes.component.html",
  styleUrls: ["./my-bikes.component.scss"],
})
export class MyBikesComponent implements OnInit {
  public athleteProfile: any;
  public user_bikes = [];

  public editingBike: any;
  public selectedBike: any;

  public modalRef: BsModalRef;
  public bikeLoading: number;

  public loaderToBeVisible = false;
  public editingBikeLoading = false;

  get isMobileOrTablet() {
    return getWindowWidth(window) < TABLET_WIDTH_THRESHOLD;
  }

  constructor(
    private userProfileService: UserProfileService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private localstorageService: LocalstorageService,
  ) {
    this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
  }

  public openLearnMoreModal() {
    const initialState = {
    };
    this.modalRef = this.modalService.show(MyBikesLearnMoreModalComponent, {
      class: "modal-lg", initialState, backdrop: false,
      ignoreBackdropClick: false });
    this.modalRef.content.displayModal = this.modalRef;
  }

  public editBike(bike) {
    this.editingBike = bike;
  }

  public selectBike(bike) {
    this.selectedBike = bike;
  }

  public save(bikeToSave) {
    this.editingBikeLoading = true;
    bikeToSave.crr = bikeToSave.manualMatrix.crr;
    bikeToSave.cda = bikeToSave.manualMatrix.baseCda;
    bikeToSave.nickName = bikeToSave.bikeName;

    this.userProfileService.saveBike(this.athleteProfile.athleteId, bikeToSave).subscribe((res) => {
      this.editingBike = null;
      this.selectedBike = null;
      this.editingBikeLoading = false;
      this.getBikeProfiles();
      this.toastr.success("Saved");
    }, (error) => {
      this.editingBikeLoading = false;
      this.onServerError(error);
    });
  }

  public async getBikeProfiles() {
    this.loaderToBeVisible = true;
    try {
      const res = await this.userProfileService.profile().toPromise();
      localStorage.athleteProfile = JSON.stringify(res.body.response.athleteProfile);
      this.user_bikes = res.body.response.athleteProfile.bikes;
      if (!this.user_bikes || !this.user_bikes.length) {
        return;
      }
      for (const bike of this.user_bikes) {
        bike.cda = parseFloat(bike.cda).toFixed(4);
        bike.crr = parseFloat(bike.crr).toFixed(4);
      }
    } catch (error) {
      CommonUtils.defaultErrorModalMessage(this.modalService);
    } finally {
      this.loaderToBeVisible = false;
    }
  }

  public ngOnInit() {
    this.getBikeProfiles();
  }
  public addBike() {
    this.editingBike = {
      active: true,
      nickName: "",
      memberId: this.athleteProfile.athleteId,
    };
  }

  public removeBike() {
    this.modalRef = this.modalService.show(ConfirmationModalComponent);
    this.modalRef.content.message = `Are you sure you want to delete ${this.editingBike.nickName || "current bike"}?`;
    this.modalRef.content.displayModal = this.modalRef;

    this.modalRef.content.confirmation.filter((x) => x).subscribe(() => {
      this.userProfileService.deleteBike(this.athleteProfile.athleteId, this.editingBike.bikeId)
        .toPromise()
        .then(() => {
          this.editingBike = null;
          this.selectedBike = null;
          this.getBikeProfiles();
          this.toastr.success("Deleted");
        }).catch((err) => {
          this.onServerError(err);
        });
    });
  }

  toggleBikeActiveStatus(active: boolean, bike: any) {
    this.bikeLoading = bike.bikeId;
    this.userProfileService.toggleBikeActiveStatus(this.athleteProfile.athleteId, bike.bikeId, active).then(() => {
      bike.active = active;
      this.bikeLoading = null;
    }).catch((error) => {
      bike.active = !active;

      this.modalRef = this.modalService.show(MessageModalComponent);
      this.modalRef.content.displayModal = this.modalRef;
      this.modalRef.content.btnSuccAndErrorText = 'OK';

      this.modalRef.content.modalTitle = 'Error deactivating bike';
      this.modalRef.content.message = error.error.body.response.msg;
      this.modalRef.content.btnSuccAndErrorStyle = 'btn btn-light btn-rounded m-auto px-5 btn-lg text-sm';
      this.modalRef.content.imageUrl = "../../../../assets/img/svg/error-icon.svg";

      this.bikeLoading = null;
    });
  }

  onServerError(error: any) {
    CommonUtils.defaultErrorModalMessage(this.modalService, error && error.error.body && error.error.body.response && error.error.body.response.msg || DEFAULT_ERROR_MESSAGE);
  }
}
