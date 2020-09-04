import { Component, Input } from '@angular/core';
import { DashboardServiceService } from '../../athlete-portal/common-services/dashboard-service.service';

@Component({
  selector: 'beginner-modal',
  templateUrl: './beginner-modal.component.html',
  styleUrls: ['./beginner-modal.component.scss']
})
export class BeginnerModalComponent {

  @Input() profile: any;
  displayModal: any;
  showMobile = false;

  constructor(private dashboardService: DashboardServiceService) {}

  get firstRace() {
    return this.profile && this.profile.firstRace;
  }

  get device() {
    return this.profile && (this.profile.deviceConnected || this.profile.athleteDoNotHaveDevice);
  }

  get mobileApp() {
    return this.profile && this.profile.mobileFirstLogin;
  }

  get assessCheck() {
    return this.profile && this.profile.assessmentChecked;
  }

  async onDismiss() {
    const res = await this.dashboardService.advancedDashboard().toPromise();
    if (res.header.status == 'success') {
      this.profile.advancedDashboardAgreed = 1;
      localStorage.athleteProfile = JSON.stringify(this.profile);
      this.displayModal.hide();
    }
  }
}
