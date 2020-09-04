import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { permissionsSidebarHeader } from '../../../../constants/constants';
import { UserProfileService } from '../../user-profile.service';
import { ConfirmationModalComponent } from '../../../../common-components/confirmation-modal/confirmation-modal.component';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { LocalstorageService } from './../../../../common-services/localstorage.service';

@Component({
  selector: 'app-health-related-data',
  templateUrl: './health-related-data.component.html',
  styleUrls: ['./health-related-data.component.scss']
})
export class HealthRelatedDataComponent implements OnInit {

  @Input() profile;
  healthCheck = true;
  modalRef: BsModalRef;
  athleteProfile: any;
  headers = permissionsSidebarHeader;
  constructor(
    private userProfileService: UserProfileService,
    private modalService: BsModalService,
    private localstorageService: LocalstorageService,
  ) {
    this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
  }

  async ngOnInit() {
    this.profile = await this._getProfile();
    console.log("helt from d b " + this.profile.allowHealthData);
    if (this.profile.allowHealthData == 1) {
      this.healthCheck = false;
    }

  }
  goBack() {
    window.history.back();
  }
  saveUserHealthRelatedPreferance(healthFlag) {
    this.userProfileService.saveUserHealthRelatedPreferance(healthFlag).subscribe((res) => {

      console.log("successfully removed " + JSON.stringify(res))
    })
  }
  funct() {

    console.log("tick " + this.healthCheck)
    if (this.healthCheck == false) {
      this.modalRef = this.modalService.show(ConfirmationModalComponent);
      this.modalRef.content.message = 'Please note that disabling the use of health-related data will result in less-than-optimal training and increased injury risk. Please confirm you’d like to disable use of this data.'
      this.modalRef.content.displayModal = this.modalRef;

      this.modalRef.content.confirmation.subscribe((decision) => {
        if (decision == true) {
          this.saveUserHealthRelatedPreferance(0);
        }
        else {
          this.healthCheck = false;
        }
      });
    }
    else {
      this.userProfileService.saveUserHealthRelatedPreferance(1).subscribe((res) => {

        console.log("successfully added" + JSON.stringify(res))
      })
    }


  }
  private async _getProfile() {
    const res = await this.userProfileService.profile().toPromise();
    localStorage.athleteProfile = JSON.stringify(res.body.response.athleteProfile);
    return res.body.response.athleteProfile;
  }



}
