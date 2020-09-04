import { Component, Input } from "@angular/core";

@Component({
  selector: "app-coach-seat-info",
  templateUrl: "./coach-seat-info.component.html",
  styleUrls: ["./coach-seat-info.component.scss"],
})
export class CoachSeatInfoComponent {
  @Input() public coachProfile: any;

  public getDefaultBillingAmount(): string {
    if (this.coachProfile.tridotBilling && this.coachProfile.defaultBillingAmount) {
      return '$' + this.coachProfile.defaultBillingAmount;
    } else {
      return 'NA';
    }
  }

  public getMonthlyRevenue() {
    if (this.coachProfile.tridotBilling && this.coachProfile.totalRevenue) {
      return '$' + this.coachProfile.totalRevenue;
    } else {
      return 'NA';
    }
  }
  
  public get availableSeatsInfo() {
    if (this.coachProfile.totalAvailableSeats < 100) {
      return (this.coachProfile.totalAvailableSeats - this.coachProfile.assignedToSeatCount) + ' / ' + this.coachProfile.totalAvailableSeats; 
    } else {
      return null;
    }
  }
}
