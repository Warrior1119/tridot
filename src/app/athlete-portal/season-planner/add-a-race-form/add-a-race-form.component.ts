import * as moment from 'moment';
import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, Input } from '@angular/core';
import { SeasonPlannerService } from '../season-planner.service';
import { raceCategory } from '../season-shared-data.service';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BS_DATEPICKER_DEFAULTS } from '../../constants/constants';
import { UserProfileService } from '../../user/user-profile/user-profile.service';
import { RaceXService } from '../../race-x/race-x.service';
import { GeolocationService } from '../../common-services/geolocation.service';
import { PLACEHOLDER_DD_MM_YYYY } from '../../constants/date-time.constants';

@Component({
  selector: 'app-add-a-race-form',
  templateUrl: './add-a-race-form.component.html',
  styleUrls: ['./add-a-race-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddARaceFormComponent implements OnInit {
  @Output() private racePriority = new EventEmitter<string>();
  @Output() private raceCategory = new EventEmitter<string>();
  @Output() private addRace = new EventEmitter<any>();
  @Input()  public loadingRace;

  private profile;
  public showFirstRaceOptions = false;

  plans: any[];
  allRaces: any[];
  availableRaces = [];
  myRaces: any[];

  selectedRacePriority;
  selectedRacePriorityColor;
  selectedRaceDistance;

  raceDistances: any[];
  selectedRace;
  full_address;
  address;

  public startDate = moment().startOf('day').toDate();
  public endDate   = moment().add(12, 'months').toDate();
  selectedDate = null;

  alerts: any[] = [];

  raceAColor = '#71d855';
  raceBColor = '#ed7c37';
  raceCColor = '#934cc3';

  customRaceName;
  isUnlistedRace: boolean;

  locationSettings = {
    inputPlaceholderText: 'Location',
    showSearchButton: false,
    geoTypes: ['(regions)', '(cities)'],
    showCurrentLocation: false,
    showRecentSearch: false,
  };

  raceAddedFirstTime = false;

  bsConfig: Partial<BsDatepickerConfig> = Object.assign({}, BS_DATEPICKER_DEFAULTS);

  constructor(private seasonPlannerService: SeasonPlannerService,
    private userProfileService: UserProfileService,
    private raceXService: RaceXService,
    private router: Router,
    private geolocationService: GeolocationService,
  ) {
  }

  private getProfile(): void {
    this.userProfileService.profile().subscribe((res) => {
      this.profile = res.body.response.athleteProfile;

      if (this.profile && this.profile.prefDateFormat) {
        this.bsConfig.dateInputFormat = this.profile.prefDateFormat === PLACEHOLDER_DD_MM_YYYY
          ? 'D MMMM, YYYY'
          : BS_DATEPICKER_DEFAULTS.dateInputFormat;
      }

      this.showFirstRaceOptions = this.noRace;
    }, (err) => {
      console.error(err);
    });
  }

  public getNeedUpgrade(racePriority: string): boolean {
    if (!this.myRaces || !this.profile) {
      return false;
    }
    const futureRaceABLength = this.myRaces.filter(x => x.raceCategory === 'A' || x.raceCategory === 'B').length;
    const futureRaceBLength = this.myRaces.filter(x => x.raceCategory === 'B').length;
    const { noOfARaces, noOfBRaces } = this.profile.subFeatures;
    switch (racePriority) {
      case 'A': return noOfARaces - futureRaceABLength <= 0;
      case 'B': return noOfBRaces - futureRaceBLength <= 0;
    }
    return false;
  }

  get noRace() {
    return !this.profile || !this.profile.firstRace;
  }

  public setAddress(address): void {
    this.address = address.data.name;
    this.full_address = address;
  }

  public setRaceDistance(raceDistance: any): void {
    this.clearRaceDistance();
    this.selectedRaceDistance = raceDistance;
    this.raceCategory.emit(this.selectedRaceDistance);
    if (this.allRaces) {
      this.availableRaces = this.allRaces
      .filter(race => new Date(race.raceStartDate).getTime() > this.startDate.getTime()
          && new Date(race.raceStartDate).getTime() < this.endDate.getTime()
          // tslint:disable-next-line:triple-equals
          && race.racexRaceDistanceId == this.selectedRaceDistance.catId
      );
    }
  }

  public setSelectedRace(race: any): void {
    if (race === 'unlisted') {
      this.isUnlistedRace = true;
      this.selectedRace = null;
      this.selectedDate = null;
      this.address = null;
      this.locationSettings = Object.assign({}, this.locationSettings, {inputString: ''});
      return;
    }
    this.selectedRace = race;
    this.selectedDate = new Date(race.raceStartDate);
    this.address = Object.values(race.address).join(' ');
    this.locationSettings = Object.assign({}, this.locationSettings, {inputString: this.address});
  }

  public formatDataAddARace(): void {
    this.loadingRace = true;
    const race = {
      racePriority: this.selectedRacePriority,
      customRaceId: -1,
      customRaceName: this.customRaceName,
      originalRaceDistanceId: this.selectedRaceDistance.catId,
      raceDate: (new Date(this.selectedDate).getMonth() + 1) + '/' +
               new Date(this.selectedDate).getDate() + '/' + new Date(this.selectedDate).getFullYear(),
      raceDistanceId: this.selectedRaceDistance.catId,
      customRace: (this.customRaceName) ? true : false,
      raceEventInstanceId: (this.selectedRace) ? this.selectedRace.raceId : '',
      state: undefined,
      zip: undefined,
      city: undefined,
      country: undefined,
    };

    if (this.selectedRace) {
      race.state = this.selectedRace.address.state;
      race.zip = this.selectedRace.address.zip;
      race.city = this.selectedRace.address.city;
      race.country = this.selectedRace.address.countryCode;
    } else {
      const { address_components } = this.full_address.data;
      const state = this.geolocationService.getAddressComponent(address_components, 'administrative_area_level_1');
      const zip = this.geolocationService.getAddressComponent(address_components, 'postal_code');
      const city = this.geolocationService.getAddressComponent(address_components, 'locality');
      const country = this.geolocationService.getAddressComponent(address_components, 'country');
      race.state = state && state.short_name;
      race.zip = zip && zip.short_name;
      race.city = city && city.short_name;
      race.country = country && country.short_name;
    }
    this.addRace.emit(race);
  }

  applyTheme(theme) {
    this.bsConfig = Object.assign({}, this.bsConfig, { containerClass: theme });
  }

  setRacePriority(tab: string) {
    this.selectedRacePriority = tab;
    this.racePriority.emit(this.selectedRacePriority);
    this.raceDistances = raceCategory.filter(category => category.racePriority === tab)[0].raceDistances;
    if (tab === 'A') {
      this.applyTheme('theme-green');
      this.selectedRacePriorityColor = this.raceAColor;
    }
    if (tab === 'B') {
      this.applyTheme('theme-orange');
      this.selectedRacePriorityColor = this.raceBColor;
    }
    if (tab === 'C') {
      this.applyTheme('theme-dark-blue');
      this.selectedRacePriorityColor = this.raceCColor;
    }
  }

  public clearRacePriority(): void {
    this.selectedRacePriority = null;
    this.racePriority.emit(null);
    this.clearRaceDistance();
  }

  public clearRaceDistance(): void {
    this.selectedRaceDistance = null;
    this.raceCategory.emit(null);
    this.clearSelectedRace();
    this.clearRaceName();
  }

  public clearSelectedRace(): void {
    this.selectedRace = null;
    this.isUnlistedRace = false;
  }

  public clearRaceName(): void {
    this.customRaceName = null;
    this.clearLocation();
    this.selectedDate = null;
    this.isUnlistedRace = false;
  }

  public clearLocation(): void {
    this.full_address = null;
    this.address = null;
    this.locationSettings = Object.assign({}, this.locationSettings, {inputString: ''});
  }

  getRaces() {
    this.seasonPlannerService.getRaces().subscribe((res) => {
      this.allRaces = res.body.races;
    });
  }

  goback() {
    window.history.back();
  }

  async ngOnInit() {
    this.getProfile();
    this.getRaces();

    try {
      const res = await this.raceXService.getRaces().toPromise();
      this.myRaces = res.body.response.futureRace;
    } catch (err) {
      console.error(err);
    }
  }

  async noScheduledRace() {
    await this.userProfileService.noScheduledRace(this.profile.athleteId);
    this.profile.firstRace = 1;
    localStorage.athleteProfile = JSON.stringify(this.profile);
    this.router.navigate(['/']);
  }

  helper() {
    this.router.navigate(['/support']);
  }

  
}
