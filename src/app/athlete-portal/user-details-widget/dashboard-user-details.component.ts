import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserProfileService } from '../user/user-profile/user-profile.service';
import { DEFAULT_PROFILE_PICTURE } from '../constants/constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-user-details',
  templateUrl: './dashboard-user-details.component.html',
  styleUrls: ['./dashboard-user-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardUserDetailsComponent implements OnInit {
  @Output() profile = new EventEmitter();

  athleteProfile;
  currentRace;
  profilePicture;

  constructor(private userProfileService: UserProfileService, private router: Router) { }

  async ngOnInit() {
    await this.updateProfile();
    this.profile.next(this.athleteProfile);
    this.profilePicture = this._getProfilePicture(this.athleteProfile.profileImageSmall);
  }

  async updateProfile() {
    this.athleteProfile = await this._getProfile();
  }

  async uploadPicture(event) {
    const file = event.target.files[0];
    const payload = new FormData();
    payload.append('file', file);
    const res = await this.userProfileService.editProfilePicture(payload).toPromise();
    if (res && res.header.status === 'success') {
      // reset athlete profile
      this.athleteProfile = await this._getProfile(); // do this to reset small & big profile pictures
      this.profile.next(this.athleteProfile);
      this.profilePicture = this._getProfilePicture(this.athleteProfile.profileImageSmall);
    }
  }

  getToolTip(type) {
    if (this.athleteProfile.onboardingStatus == 'incomplete' && type == 'Swim' && this.athleteProfile.swimdot) {
      return 'Based on your data, this is your current SwimDot';
    } else if (this.athleteProfile.onboardingStatus == 'incomplete' && type == 'Bike' && this.athleteProfile.bikedot) {
      return 'Based on your data, this is your current BikeDot';
    } else if (this.athleteProfile.onboardingStatus == 'incomplete' && type == 'Run' && this.athleteProfile.rundot) {
      return 'Based on your data, this is your current RunDot';
    }
  }

  hasNextRace() {
    const race = this.athleteProfile.races.find(
      race => race.raceId == this.currentRace.raceId
    );
    const index = this.athleteProfile.races.indexOf(race);
    return !!this.athleteProfile.races[index + 1];
  }

  hasPreviousRace() {
    const race = this.athleteProfile.races.find(
      race => race.raceId == this.currentRace.raceId
    );
    const index = this.athleteProfile.races.indexOf(race);
    return !!this.athleteProfile.races[index - 1];
  }

  nextRace() {
    const race = this.athleteProfile.races.find(
      race => race.raceId == this.currentRace.raceId
    );
    const index = this.athleteProfile.races.indexOf(race);
    if (this.athleteProfile.races[index + 1]) {
      const nextRace = this.athleteProfile.races[index + 1];
      this.currentRace = nextRace;
    }
  }

  previousRace() {
    const race = this.athleteProfile.races.find(
      race => race.raceId == this.currentRace.raceId
    );
    const index = this.athleteProfile.races.indexOf(race);
    if (this.athleteProfile.races[index - 1]) {
      const nextRace = this.athleteProfile.races[index - 1];
      this.currentRace = nextRace;
    }
  }

  isOpen(type) {
    if (this.athleteProfile.onboardingStatus == 'incomplete'
      && type == 'Swim'
      && this.athleteProfile.swimdot != 0
      && this.athleteProfile.bikedot == 0
      && this.athleteProfile.rundot == 0
    ) {
      return true;
    } else if (this.athleteProfile.onboardingStatus == 'incomplete'
      && type == 'Bike'
      && this.athleteProfile.swimdot != 0
      && this.athleteProfile.bikedot != 0
      && this.athleteProfile.rundot == 0
    ) {
      return true;
    } else if (this.athleteProfile.onboardingStatus == 'incomplete'
      && type == 'Run'
      && this.athleteProfile.swimdot != 0
      && this.athleteProfile.bikedot != 0
      && this.athleteProfile.rundot != 0
    ) {
      return true;
    }
  }

  private async _getProfile() {
    const res = await this.userProfileService.profile().toPromise();
    this.currentRace = res.body.response.athleteProfile.comingRace;
    return res.body.response.athleteProfile;
  }

  private _getProfilePicture(profilePicture: string) {
    return profilePicture ? `${environment.API_ENDPOINT}${profilePicture}` : DEFAULT_PROFILE_PICTURE;
  }

  /**
   * Navigates ti Race Screen for a give raceId.
   * @param raceId
   */
  public goToRace(raceId: number): void {
    this.router.navigate(['/racex'], { queryParams: {raceId} });
  }
}
